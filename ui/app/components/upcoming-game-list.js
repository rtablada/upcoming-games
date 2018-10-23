import Component from '@ember/component';
import platforms from '../game-platforms';
import config from 'upcoming-games/config/environment';

export default class extends Component {
  didReceiveAttrs() {
    const platformId = this.platform;

    if (platformId) {
      const platform = platforms.find(a => a.id == platformId);

      this.set('selectedPlatform', platform);
      this.loadData(platformId);
    }

  }

  async loadData(platform) {
    const req = await fetch(`${config.host}/games?platform=${platform}`);
    const data = await req.json();

    this.set('games', data);
  }
}
