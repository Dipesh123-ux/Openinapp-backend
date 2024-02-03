const calculatePriority = (due_date) => {
    const today = new Date();
    const dueDate = new Date(due_date);
    let priority;

    if (dueDate.toDateString() === today.toDateString()) {
        priority = 0;
    } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        let dd = dueDate.getDate()
        let tm = tomorrow.getDate()
        let dtm = dayAfterTomorrow.getDate()

        let ddtm = new Date(today);
        ddtm.setDate(today.getDate() + 4);

        let ddtmm = ddtm.getDate();

        if (dd >= tm && dd <= dtm) {
            priority = 1;
        } else if (dd > dtm && dd <= ddtmm) {
            priority = 2;
        } else {
            priority = 3;
        }
    }

    return priority;
}

module.exports = calculatePriority;