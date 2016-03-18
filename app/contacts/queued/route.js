import Ember from 'ember';

const {
  Route,
  inject
} = Ember;

export default Route.extend({
  queue: inject.service(),

  model() {
    let route = this;
    return this.store.findAll('contact', {
      scope: 'global',
      subscribeTo: {
        new(store, payload) {
          route.get('queue').enqueue('contacts', payload);
        },

        update(store, payload) {
          store.push(payload);
        }
      }
    });
  }
})
