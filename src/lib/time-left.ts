export const getTimeLeft = (deadline: Date) => {
  const now = new Date();
  console.log(deadline, typeof deadline);
  const timeDiff = new Date(deadline).getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { months: 0, days: 0, expired: true };
  }

  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  return { months, days: remainingDays, expired: false };
};
