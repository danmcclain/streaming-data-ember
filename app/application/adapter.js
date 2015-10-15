import DS from 'ember-data';
import Ember from 'ember';

const {
  RSVP,
  get,
  inject,
  set
} = Ember;

export default DS.Adapter.extend({
  defaultSerializer: '-json-api',
  phoenix: inject.service(),
  channel: null,

  createRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true })

    const channel = get(this, 'channel');

    if (channel) {
      return channel.push('create', data);
    } else {
    }
  },

  findRecord(store, type, id, snapshot) {
    debugger;
  },

  findAll(store, type, sinceToken) {
    const adapter = this;
    var serializer = store.serializerFor(type.modelName);
    const phoenix = get(this, 'phoenix');

    return phoenix.channel('contacts:index')
      .then((channel) => {
        channel.on('new_contact', (payload) => {
          payload = serializer._normalizeResponse(null, null, payload);
          store.push(payload);
        });
        return channel.join();
      })
      .then((channel) => {
        set(adapter, 'channel', channel);
        return channel.push('all')
      });
  }
});
