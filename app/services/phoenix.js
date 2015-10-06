import Ember from 'ember';
import { Socket } from 'phoenix';

const {
  RSVP,
  Service,
  on,
  set
} = Ember;

export default Service.extend({
  socket: null,
  connect: on('init', function() {
    const socket = new Socket('/socket');

    const promise = new RSVP.Promise(function(resolve, reject) {
      socket.onOpen(() => {
        resolve(socket);
      });
    });
    socket.connect();

    set(this, 'socket', promise);
  })
});
