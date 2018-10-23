import Component from '@ember/component';
import platforms from '../game-platforms';

export default class extends Component {
  constructor() {
    super(...arguments);

    this.set('platforms', platforms);
  }
}
