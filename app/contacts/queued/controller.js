import Ember from 'ember';

export default Ember.Controller.extend({
  queue: Ember.inject.service(),

  actions: {
    flushQueue() {
      this.get('queue').flushToStore('contacts');
    }
  }
});
