
import { defaults } from './defaults';

class PlyrAds {

  constructor(target, options) {
    this.config = {
      ...defaults,
      options
    };
  }
}

export default PlyrAds;
