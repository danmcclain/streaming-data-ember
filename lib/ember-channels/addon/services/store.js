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
      let serializer = this.serializerFor(name);
      let phoenix = get(this, 'phoenix');

      phoenix.channel(`${pluralize(name)}:index`).then((channel) => {
        options.subscribeTo.forEach((event) => {
          channel.on(event, (payload) => {
            payload = serializer._normalizeResponse(null, null, payload);
            this.push(payload);
          });
        });
      });
    }

    return results;
  },

  unsubscribe(channelName, event) {
    let phoenix = get(this, 'phoenix');

    phoenix.channel(`${pluralize(channelName)}:index`).then((channel) => {
      channel.off(event);
    });
  }
});
