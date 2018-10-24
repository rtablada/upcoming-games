import { helper } from '@ember/component/helper';
import moment from 'moment';

export default helper(([timestamp]) => {
  const date = new Date(timestamp);
  const mDate = moment(date);

  return mDate.format('MMMM Do YY');
});
