import DS from 'ember-data'
import Ember from 'ember';

const { Store } = DS;
const { get, isEmpty, inject } = Ember;

export default Store.extend({
  phoenix: inject.service(),
  findAll(name, options) {
    let results = this._super(name, options);
    if (!isEmpty(options.subscribeTo)) {
      let serializer = this.serializerFor(name);
      let phoenix = get(this, 'phoenix');

      phoenix.channel('contacts:index').then((channel) => {
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

    phoenix.channel('contacts:index').then((channel) => {
      channel.off(event);
    });
  }
});
