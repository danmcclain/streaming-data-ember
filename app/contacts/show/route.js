import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({
  model({ id }) {
    return this.store.findRecord('contact', id);
  }
});
