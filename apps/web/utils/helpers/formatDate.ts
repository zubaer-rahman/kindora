import moment from 'moment';

const formatDate = (isoDate: string): string => {
  const parsedDate = moment(isoDate);

  if (!parsedDate.isValid()) {
    throw new Error(
      'Invalid date format. Please provide a valid ISO date string.'
    );
  }

  return parsedDate.format('DD MMM YYYY');
};

try {
  formatDate('invalid-date');
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('An unknown error occurred');
  }
}

export default formatDate;
