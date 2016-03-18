import Ember from 'ember';

const {
  A: EmberArray,
  Service,
  get,
  inject,
  set
} = Ember;

export default Service.extend({
  store: inject.service(),
  init() {
    this._super(...arguments);

    this.queues = {};
  },

  enqueue(queueName, payload) {
    let queue = get(this, `queues.${queueName}`);

    if (!queue) {
      queue = set(this, `queues.${queueName}`, EmberArray());
    }

    queue.pushObject(payload);
  },

  flushToStore(queueName) {
    let queue = get(this, `queues.${queueName}`);
    let store = get(this, 'store');

    if (!!queue) {
      queue.forEach((payload) => {
        store.push(payload);
      });

      set(this, `queues.${queueName}`, undefined);
    }
  }
});
