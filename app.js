document.addEventListener('DOMContentLoaded', async function() {
    // Функция для получения праздников из JSON-файла
    async function getCustomHolidays() {
        try {
            const response = await fetch('holidays.json');
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке JSON-файла: ${response.statusText}`);
            }
            const data = await response.json();
            return data.holidays.map(dateString => new Date(dateString));
        } catch (error) {
            console.error('Ошибка при загрузке праздников:', error);
            return []; // Возвращаем пустой массив в случае ошибки
        }
    }

    // Функция для нормализации даты (обнуление времени)
    function normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // Функция для проверки, является ли день выходным или праздничным
    function isHolidayOrWeekend(date, holidays) {
        const dayOfWeek = date.getDay(); // 0 - воскресенье, 6 - суббота
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const normalizedDate = normalizeDate(date);
        const isHoliday = holidays.some(holiday => normalizeDate(holiday).getTime() === normalizedDate.getTime());
        return isWeekend || isHoliday;
    }

    // Функция для генерации учебных дней от startDate до endDate
    async function generateAcademicDays(startDate, endDate) {
        let dates = [];
        let currentDate = new Date(startDate);
        const holidays = await getCustomHolidays();

        while (currentDate <= endDate) {
            if (!isHolidayOrWeekend(currentDate, holidays)) {
                dates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    // Функция для получения следующего 1 июня
    function getNextSummer() {
        const now = new Date();
        const currentYear = now.getFullYear();
        let nextSummer = new Date(`${currentYear}-06-01`);

        if (now > nextSummer) {
            nextSummer = new Date(`${currentYear + 1}-06-01`);
        }

        return nextSummer;
    }

    // Основной расчет
    const startDate = new Date();
    const endDate = getNextSummer();
    const academicDays = await generateAcademicDays(startDate, endDate);

    // Отображение учебных дней
    const scheduleList = document.getElementById('schedule');
    academicDays.forEach(date => {
        const listItem = document.createElement('li');
        listItem.textContent = date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        scheduleList.appendChild(listItem);
    });

    // Обновление обратного отсчета учебных дней
    function updateCountdown() {
        const now = new Date();
        const remainingAcademicDays = academicDays.filter(date => date > now);

        if (remainingAcademicDays.length === 0) {
            document.getElementById('countdown-timer').textContent = 'Лето уже началось!';
            return;
        }

        const days = remainingAcademicDays.length;
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
    }

    updateCountdown();
});
