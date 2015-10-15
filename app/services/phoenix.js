import Ember from 'ember';
import { Socket } from 'phoenix';

const {
  RSVP,
  Service,
  get,
  on,
  set
} = Ember;

const { Promise } = RSVP;

const ChannelProxy = Ember.Object.extend({
  init(channel) {
    set(this, 'channel', channel);
  },

  join() {
    return new Promise((resolve, reject) => {
      const channel = get(this, 'channel');
      channel.join()
        .receive('ok', () => {
          resolve(this);
        })
        .receive('error', (payload) => {
          reject(payload);
        });
    });
  },

  on(event, callback) {
    get(this, 'channel').on(event, callback);
  },

  off(event) {
    get(this, 'channel').off(event);
  },

  push(event, payload) {
    return new Promise((resolve, reject) => {
      get(this, 'channel').push(event, payload)
        .receive('ok', (payload) => {
          resolve(payload);
        })
        .receive('error', (payload) => {
          reject(payload);
        });
    });
  }
});

export default Service.extend({
  socket: null,
  connect: on('init', function() {
    const socket = new Socket('/socket');

    const promise = new RSVP.Promise(function(resolve) {
      socket.onOpen(() => {
        resolve(socket);
      });
    });
    socket.connect();

    set(this, 'socket', promise);
  }),

  channel(channelName, options) {
    return get(this, 'socket').then((socket) => {
      const channel = socket.channel(channelName, options);
      return new ChannelProxy(channel);
    });
  }
});
