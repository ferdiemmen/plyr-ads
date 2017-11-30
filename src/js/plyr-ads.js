
import defaults from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = {
      ...defaults,
      options
    };
  }

  foo() {
    console.log('bar');
  }
}

export default PlyrAds;
