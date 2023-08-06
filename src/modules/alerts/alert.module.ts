import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TransactionSchema } from './schemas/transaction.schema'

import { AlertController } from './alert.controller'
import { AlertService } from './alert.service'
import { AlertSchema } from './schemas/alert.schema'
import { TradingBotEventSchema } from './schemas/trading-bot-event.schema'
import { SnipeAlertSchema } from './schemas/snipe-alert.schema'
import { TokenSchema } from './schemas/token.schema'
import { UserSchema } from './schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'alerts', schema: AlertSchema },
      { name: 'tokens', schema: TokenSchema },
      { name: 'snipe_alerts', schema: SnipeAlertSchema },
      { name: 'transactions_mev2', schema: TransactionSchema },
      { name: 'bot_events', schema: TradingBotEventSchema },
      { name: 'users', schema: UserSchema },
    ]),
  ],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}
