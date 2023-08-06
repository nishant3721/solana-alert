import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

const axios = require('axios')
const Twit = require('twit')

import { Alert } from './../../models/alert'
import { Transaction } from './../../models/transaction'
import { Notification } from './../../models/notification'
import { Token } from './../../models/token'
import { TradingBotEvent } from './../../models/trading-bot-event'
import { SnipeAlert } from 'src/models/snipe-alert'
import { User } from 'src/models/user'

@Injectable()
export class AlertService {
  NOTIFICATION_TYPE = { DISCORD: 'discord', SMS: 'sms', WHATSAPP: 'whatsApp' }
  tweetClient = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  })
  smsClient: any
  whatsAppClient: any
  zionKey: { NAME: 'ZK'; EVENT_TYPE: 'LIST' }

  constructor(
    @InjectModel('alerts') private readonly alertModel: Model<Alert>,
    @InjectModel('snipe_alerts')
    private readonly snipeAlertModel: Model<SnipeAlert>,
    @InjectModel('bot_events')
    private readonly botModel: Model<TradingBotEvent>,
    @InjectModel('tokens') private readonly tokenModel: Model<Token>,
    @InjectModel('transactions_mev2')
    private readonly transactionModel: Model<Transaction>,
    @InjectModel('users')
    private readonly userModel: Model<User>,
  ) {
    // NOTE: to start the bot to listen changes on collections
    // db must be running in replica mode.. follow the link for info
    // https://stackoverflow.com/questions/70132872/mongodb-listen-changes-on-collection-change-nodejs
    this.startAlertBot()
  }

  async getPrivacy(walletId: string): Promise<User> {
    const query = { walletId: walletId }
    return await this.userModel.findOne(query).exec()
  }

  getTokens({ pageNo = 1, count = 20, _ids = [] }): Promise<Token[]> {
    pageNo = pageNo - 1

    let query = {}

    if (_ids && _ids.length) {
      query = {
        _id: { $in: _ids },
      }
    }

    return this.tokenModel
      .find(query)
      .limit(count * 1)
      .select({ name: 1, rank: 1, image: 1 })
      .skip(pageNo * count)
      .sort({ _id: 1 })
      .exec()
  }

  getSnipeAlerts(walletId?: string): Promise<SnipeAlert[]> {
    let query: any = {}
    if (walletId && walletId.length) {
      query = { walletId }
    }
    return this.snipeAlertModel.find(query).exec()
  }

  getAlerts(walletId?: string, isDisabled?: boolean): Promise<Alert[]> {
    const query: any = {}
    if (walletId) {
      query.walletId = walletId
    }

    if (isDisabled != undefined && isDisabled != null) {
      query.isDisabled = isDisabled
    }

    return this.alertModel.find(query).exec()
  }

  startAlertBot(): void {
    console.debug('Starting Alert Bot...')

    // configure sms and WhatsApp client
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    this.smsClient = require('twilio')(accountSid, authToken)
    this.whatsAppClient = require('twilio')(accountSid, authToken)

    // listen transaction changes
    this.transactionModel.watch().on('change', async (transactionInfoEvent) => {
      const transaction: Transaction = transactionInfoEvent.fullDocument
      console.log({ transaction })
      // debugger
      if (!transaction?.parsed?.mint) return
      if (!transaction?.parsed?.collection_id) return
      if (!transaction?.parsed?.collection_name) return
      if (!transaction?.parsed?.token_name) return
      // debugger
      console.log('transaction info: ', transaction)

      if (
        transaction.parsed?.collection_id == '626c88d7ff719c6cee53c51b' &&
        transaction.parsed?.event_type == 'LIST'
      ) {
        const specialNotification: Notification = {
          token_mint_address: transaction.parsed?.mint,
          marketPlace: transaction.parsed?.marketplace,
          collectionName: transaction.parsed?.collection_name,
          eventType: transaction.parsed?.event_type,
          amount: transaction.parsed?.amount,
        }
        await this._sendDiscordNotification(
          process.env.DISCORD_WEBHOOK_URL,
          specialNotification,
        )
      }

      // get the active alerts
      const alerts = await this.getAlerts(null, false)
      const alertsResponse = alerts.map(async (alert: Alert): Promise<any> => {
        // check the alert if match with the info
        if (
          (alert.alertType || '').toLowerCase() ===
            (transaction.parsed?.event_type || '').toLowerCase() &&
          (alert.collectionName || '').toLowerCase() ===
            (transaction.parsed?.collection_name || '').toLowerCase()
        ) {
          const notification: Notification = {
            token_mint_address: transaction.parsed?.mint,
            tokenName: transaction.parsed?.token_name,
            marketPlace: transaction.parsed?.marketplace,
            collectionName: transaction.parsed?.collection_name,
            eventType: transaction.parsed?.event_type,
            amount: transaction.parsed?.amount,
          }
          // To get the image URL, use token mint address as token mint Id
          const token = await this.tokenModel
            .findById(transaction.parsed?.mint)
            .select({ image: 1 })
            .lean()
            .exec()

          if (token?.image?.length) {
            notification.imageUrl = token.image
          }

          if (alert.notificationInfo.via === this.NOTIFICATION_TYPE.DISCORD) {
            // send notifiation to discord url
            return this._sendDiscordNotification(
              alert.notificationInfo.url,
              notification,
            )
          } else if (
            alert.notificationInfo.via === this.NOTIFICATION_TYPE.SMS
          ) {
            // send notifiation to sms
            return this._sendSmsNotification(
              alert.notificationInfo.phone,
              notification,
            )
          } else if (
            // send notifiation to whatsapp
            alert.notificationInfo.via === this.NOTIFICATION_TYPE.WHATSAPP
          ) {
            return this._sendWhatsAppNotification(
              alert.notificationInfo.whatsapp,
              notification,
            )
          }
        }
      })

      await Promise.allSettled(alertsResponse)
        .then((results) => {
          console.log('alerts executed', results)
        })
        .catch((err) => {
          console.error('error sending alerts', err)
        })
    })

    // listen bot transaction changes
    this.botModel.watch().on('change', async (info) => {
      const event: TradingBotEvent = info.fullDocument
      if (!event?.token_name) return
      if (!event?.bot_config?.collection_name) return
      if (!event || event.result.status !== 'SUCCESS') return
      if (!event.user_wallet.pubkey) return
      const botAlerts = await this.getSnipeAlerts(event.user_wallet.pubkey)
      debugger
      if (!botAlerts?.length) return

      console.debug('bot alerts', botAlerts)
      const botAlertResponse = botAlerts.map(
        async (alert: Alert): Promise<any> => {
          const notification: Notification = {
            marketPlace: event.marketplace,
            tokenName: event.token_name,
            collectionName: event.collection_name,
            eventType: event.event_type,
            token_mint_address: event.mint,
            amount: event.amount,
          }
          // To get the image URL, use token mint address as token mint Id
          // TODO: change this to do a simpler and faster tokenModel.findById(tokenId);
          const tokens = await this.getTokens({
            _ids: [event.mint],
          })
          if (tokens.length) {
            if (tokens[0].image && tokens[0].image.length) {
              notification.imageUrl = tokens[0].image
            }
          }
          console.log('sniper bot alert notification:', notification)

          if (alert.notificationInfo.via === this.NOTIFICATION_TYPE.DISCORD) {
            // send notifiation to discord url
            await this._sendSnipeDiscordNotification(
              alert.notificationInfo.url,
              notification,
            )
          } else if (
            alert.notificationInfo.via === this.NOTIFICATION_TYPE.SMS
          ) {
            // send notifiation to sms
            await this._sendSmsNotification(
              alert.notificationInfo.phone,
              notification,
            )
          } else if (
            // send notifiation to whatsapp
            alert.notificationInfo.via === this.NOTIFICATION_TYPE.WHATSAPP
          ) {
            await this._sendWhatsAppNotification(
              alert.notificationInfo.whatsapp,
              notification,
            )
          }
          const userInfo: any = await this.getPrivacy(event.user_wallet.pubkey)
          if (userInfo.settings.bot_privacy === true) {
            return
          }
          this._sendSnipeDiscordNotification(
            'https://discord.com/api/webhooks/935273013081948241/g2ZL_ok5G3zxGw7jvKcrRdoo9i3fDWfqOlJT2DIxVwWupZrk_XJhQhx0Gt1v1NADnkRU',
            notification,
          )
          this._autoTweet(notification)
        },
      )

      await Promise.allSettled(botAlertResponse)
        .then((results) => {
          console.debug('sniper bot alerts executed', results)
        })
        .catch((err) => {
          console.error('error sending sniper bot alerts', err)
        })
    })
  }

  private async _sendDiscordNotification(
    url: string,
    notification: Notification,
  ): Promise<void> {
    let discordMessage
    // add the info in fields to send more info
    if (notification.eventType === 'DELIST' || notification.amount == null) {
      discordMessage = {
        embeds: [
          {
            fields: [
              {
                name: 'Alerts by Zion Labs\n\nNFT',
                value: `https://zionlabs.xyz/token/${notification.token_mint_address}`,
              },
              {
                name: 'Collection Name',
                value: notification.collectionName,
              },
              {
                name: 'Market',
                value: notification.marketPlace,
              },
              {
                name: 'Collection Name',
                value: notification.collectionName,
              },
            ],
            image: { url: notification.imageUrl },
          },
        ],
      }
    } else {
      discordMessage = {
        embeds: [
          {
            fields: [
              {
                name: 'Alerts by Zion Labs\n\nNFT',
                value: `https://zionlabs.xyz/token/${notification.token_mint_address}`,
              },
              {
                name: 'Collection Name',
                value: notification.collectionName,
              },
              {
                name: 'Market',
                value: notification.marketPlace,
              },
              {
                name: 'Event Type',
                value: notification.eventType,
              },
              {
                name: 'Collection Name',
                value: notification.collectionName,
              },
              {
                name: 'Price',
                value: notification.amount + ' SOL',
              },
            ],
          },
        ],
      }
    }
    try {
      return await axios.post(url, discordMessage)
    } catch (err) {
      console.error('Error while sending notification to discord', err)
      return Promise.reject(err)
    }
  }

  private async _sendSnipeDiscordNotification(
    url: string,
    notification: Notification,
  ): Promise<void> {
    let discordMessage
    // add the info in fields to send more info
    discordMessage = {
      image: { url: notification.imageUrl },
      embeds: [
        {
          fields: [
            {
              name: 'ZION SNIPE!',
              value: '<-------->',
            },
            {
              name: 'Collection Name',
              value: `${notification.collectionName}`,
            },
            {
              name: 'Market',
              value: `${notification.marketPlace}`,
            },
            {
              name: 'Token Name',
              value: `${notification.tokenName}`,
            },
            {
              name: 'NFT',
              value: `https://zionlabs.xyz/token/${notification.token_mint_address}`,
            },
          ],
        },
      ],
    }
    try {
      return await axios.post(url, discordMessage)
    } catch (err) {
      console.error('Error while sending notification to discord', err)
      return Promise.reject(err)
    }
  }

  private async _sendSmsNotification(
    phone: string,
    notification: Notification,
  ): Promise<any> {
    const smsBody = `Sniped by Zion Labs!
    \nToken Name = ${notification.tokenName}
    \nCollection Name = ${notification.collectionName}
    \nMarket = ${notification.marketPlace}
    \nPrice = ${notification.amount} SOL`
    return await this.smsClient.messages
      .create({
        body: smsBody,
        messagingServiceSid: process.env.MESSAGING_SID,
        from: process.env.TWILIO_SMS_FROM,
        to: phone,
      })
      .then((message) => {
        console.log('twillio sms response', message.sid)
        return Promise.resolve(message)
      })
      .catch((err) => {
        console.log('Unable to send message to: ', phone, err)
        return Promise.resolve(err)
      })
  }
  private async _sendWhatsAppNotification(
    phone: string,
    notification: Notification,
  ): Promise<void> {
    const whatsappBody = `Alerts by Zion Labs\nNFT =${`https://zionlabs.xyz/token/${notification.token_mint_address}`}\nMarket = ${
      notification.marketPlace
    }\nEvent Type = ${notification.eventType}\nCollection Name = ${
      notification.collectionName
    }\n${
      notification.eventType === 'DELIST' || notification.amount == null
        ? ''
        : `Price = ${notification.amount} SOL`
    }\n`
    return await this.whatsAppClient.messages
      .create({
        body: whatsappBody,
        mediaUrl: notification.imageUrl,
        messagingServiceSid: process.env.MESSAGING_SID,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${phone}`,
      })
      .then((message) => {
        console.log('twillio whatsapp response', message.sid)
        return Promise.resolve(message)
      })
      .catch((err) => {
        console.log('Unable to send WhatsApp message to: ', phone, err)
        return Promise.reject(err)
      })
  }

  private async _autoTweet(notification: Notification): Promise<void> {
    const tweetBody = `Market = ${notification.marketPlace}\nToken Name = ${
      notification.tokenName
    }\nEvent Type = ${notification.eventType}\nCollection Name = ${
      notification.collectionName
    }\n${
      notification.eventType === 'DELIST' || notification.amount == null
        ? ''
        : `Price = ${notification.amount} SOL`
    }`
    try {
      var encoded = await this.getBase64FromImgUrl(notification.imageUrl)
      await this.tweetClient.post(
        'media/upload',
        { media_data: encoded },
        async (err, data, response) => {
          // now we can assign alt text to the media, for use by screen readers and
          // other text-based presentations and interpreters
          var mediaIdStr = data.media_id_string
          var meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: tweetBody },
          }
          console.log('twitter auto tweet bot info: ', data)
          console.log('twitter auto tweet bot error info: ', err)
          await this.tweetClient.post(
            'media/metadata/create',
            meta_params,
            async (err, data, response) => {
              if (!err) {
                // now we can reference the media and post a tweet (media will attach to the tweet)
                var params = {
                  status: tweetBody,
                  media_ids: [mediaIdStr],
                }

                await this.tweetClient.post(
                  'statuses/update',
                  params,
                  (err, data, response) => {
                    // console.log(data);
                  },
                )
              }
            },
          )
        },
      )
    } catch (error) {
      console.error('Twitter triying to reconnect...')
    }
  }

  async getBase64FromImgUrl(url: any): Promise<any> {
    try {
      if (url.includes('https')) {
        let image = await axios.get(url, {
          responseType: 'arraybuffer',
        })
        let returnedB64 = Buffer.from(image.data).toString('base64')
        return returnedB64
      } else {
        let image = await axios.get(
          'https://firstlease.in/storage/media/no-image-available.png',
          {
            responseType: 'arraybuffer',
          },
        )
        let returnedB64 = Buffer.from(image.data).toString('base64')
        return returnedB64
      }
    } catch (error) {
      console.log('failed to encode required image')
    }
  }
}
