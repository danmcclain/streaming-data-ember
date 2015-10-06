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
      return new RSVP.Promise((resolve, reject) => {
        channel.push('create', data)
        .receive('ok', (payload) => { resolve(payload); })
        .receive('error', (payload) => { reject(payload); });
      });
    } else {
    }
  },

  findAll(store, type, sinceToken) {
    const adapter = this;
    var serializer = store.serializerFor(type.modelName);
    const phoenix = get(this, 'phoenix');

    return get(phoenix, 'socket')
      .then((socket) => {
        const promise = new RSVP.Promise((resolve, reject) => {
          const channel = socket.channel("contacts:index", {});
          channel.on('new_contact', (payload) => {
            payload = serializer._normalizeResponse(null, null, payload);
            store.push(payload);
          });

          channel.join().receive('ok', ({contacts}) => {
            resolve(channel);
          }).receive('error', () => {
            reject('errored');
          });
        })
        .then((channel) => {
          const promise = new RSVP.Promise((resolve, reject) => {
            set(adapter, 'channel', channel);
            channel.push('all')
            .receive('ok', (payload) => { resolve(payload) })
            .receive('error', () => { reject('Sent all unsucessfully') });
          })
          return promise;
        });
        return promise;
      });
  }
});
