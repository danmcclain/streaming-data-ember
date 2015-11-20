import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({
  model() {
    return this.store.findAll('contact', { scope: 'global', subscribeTo: ['new', 'updates'] });
  }
})
