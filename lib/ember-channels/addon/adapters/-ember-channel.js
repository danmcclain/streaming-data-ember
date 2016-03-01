import DS from 'ember-data';
import Ember from 'ember';

const {
  RSVP,
  String: { pluralize },
  get,
  inject,
  set
} = Ember;

export default DS.Adapter.extend({
  defaultSerializer: '-json-api',
  phoenix: inject.service(),

  createRecord(store, type, snapshot) {
    let data = {};
    let channelName = pluralize(type.modelName);
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true })

    let phoenix = get(this, 'phoenix');

    return phoenix.channel(`${channelName}:index`).then((channel) => {
      return channel.push('create', data);
    });
  },

  updateRecord(store, type, snapshot) {
    let data = {};
    let channelName = pluralize(type.modelName);
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true })

    let phoenix = get(this, 'phoenix');

    return phoenix.channel(`${channelName}:index`).then((channel) => {
      return channel.push('update', data);
    });
  },

  findRecord(store, type, id, snapshot) {
    let phoenix = get(this, 'phoenix');
    let channelName = pluralize(type.modelName);

    return phoenix.channel(`${channelName}:index`).then((channel) => {
      return channel.push('find', id);
    });
  },

  findAll(store, type, sinceToken) {
    const adapter = this;
    var serializer = store.serializerFor(type.modelName);
    const phoenix = get(this, 'phoenix');
    let channelName = pluralize(type.modelName);

    return phoenix.channel(`${channelName}:index`).then((channel) => {
      return channel.push('all');
    });
  }
});
