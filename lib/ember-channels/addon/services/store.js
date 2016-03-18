import DS from 'ember-data';
import Ember from 'ember';

const { Store } = DS;
const { get, isPresent, inject, String: { pluralize } } = Ember;

export default Store.extend({
  adapter: '-ember-channel',
  phoenix: inject.service(),

  findAll(name, options) {
    let results = this._super(name, options);

    if (isPresent(options.subscribeTo)) {
      let phoenix = get(this, 'phoenix');

      phoenix.channel(`${pluralize(name)}:index`).then((channel) => {
        if (options.subscribeTo.length) { // Array
          options.subscribeTo.forEach((event) => {
            channel.on(event, (payload) => {
              let normalizedPayload = this.normalize(name, payload);
              this.push(normalizedPayload);
            });
          });
        } else {
          Object.keys(options.subscribeTo).forEach((event) => {
            channel.on(event, (payload) => {
              let normalizedPayload = this.normalize(name, payload);
              options.subscribeTo[event](this, normalizedPayload);
            });
          });
        }
      });
    }

    return results;
  },

  normalize(name, payload) {
    let serializer = this.serializerFor(name);
    let modelClass = this.modelFor(name);

    if (payload.data.length) { // many records
      payload = serializer.normalizeArrayResponse(this, modelClass, payload);
    } else {
      payload = serializer.normalizeSingleResponse(this, modelClass, payload);
    }

    return payload;
  },

  unsubscribe(channelName, event) {
    let phoenix = get(this, 'phoenix');

    phoenix.channel(`${pluralize(channelName)}:index`).then((channel) => {
      channel.off(event);
    });
  }
});
