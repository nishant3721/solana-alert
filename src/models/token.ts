export class Token {
  _id?: string;
  name?: string;
  rank?: number;
  ranks?: any[];
  collection_id: string;
  collection_name: string;
  attributes: any[];
  image: string;
  total_rarity: string;

  constructor(data: {
    _id?: string;
    name?: string;
    rank?: number;
    ranks?: any[];
    collection_id?: string;
    collection_name?: string;
    attributes?: any[];
    image?: string;
    total_rarity?: string;
  }) {
    if (!data) {
      data = {};
    }

    this._id = data._id || null;
    this.collection_id = data.collection_id || null;
    this.name = data.name || null;
    this.rank = data.rank || null;
    this.ranks = data.ranks || [];
    this.collection_name = data.collection_name || null;
    this.attributes = data.attributes || [];
    this.image = data.image || null;
    this.total_rarity = data.total_rarity || null;
  }
}
