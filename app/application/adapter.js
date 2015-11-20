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

  createRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true })

    const phoenix = get(this, 'phoenix');

    return phoenix.channel('contacts:index').then((channel) => {
      debugger
      return channel.push('create', data);
    });
  },

  updateRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true })

    const phoenix = get(this, 'phoenix');

    return phoenix.channel('contacts:index').then((channel) => {
      return channel.push('update', data);
    });
  },

  findRecord(store, type, id, snapshot) {
    const phoenix = get(this, 'phoenix');

    return phoenix.channel('contacts:index').then((channel) => {
      return channel.push('find', id);
    });
  },

  findAll(store, type, sinceToken) {
    const adapter = this;
    var serializer = store.serializerFor(type.modelName);
    const phoenix = get(this, 'phoenix');

    return phoenix.channel('contacts:index').then((channel) => {
      return channel.push('all');
    });
  }
});
