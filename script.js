// Initialize EmailJS with your Public Key
(function() {
    emailjs.init("9wfngz6TqxjBFnFfc"); // Replace with your actual EmailJS public key
})();

document.addEventListener('DOMContentLoaded', function() {
    // Calendar functionality
    let currentDate = new Date();
    let selectedDate = null;
    
    const monthYearElement = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const selectedDateInput = document.getElementById('selected-date');
    
    // Initialize calendar
    renderCalendar(currentDate);
    
    // Event listeners for month navigation
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
    
    // Function to render the calendar
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Set month and year header
        monthYearElement.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Clear previous calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-cell', 'day-header');
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });
        
        // Get first day of month and number of days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get number of days from previous month to show
        const daysFromPrevMonth = firstDay;
        
        // Get number of days from next month to show
        const totalCells = 42; // 6 rows x 7 days
        const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
        
        // Add days from previous month
        const prevMonth = new Date(year, month - 1, 1);
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const cell = createCalendarCell(day, true);
            calendarGrid.appendChild(cell);
        }
        
        // Add days from current month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const isPast = cellDate < today;
            const cell = createCalendarCell(day, false, isPast);
            
            // Check if this day is selected
            if (selectedDate && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === month && 
                selectedDate.getFullYear() === year) {
                cell.classList.add('selected');
            }
            
            calendarGrid.appendChild(cell);
        }
        
        // Add days from next month
        for (let day = 1; day <= daysFromNextMonth; day++) {
            const cell = createCalendarCell(day, true);
            calendarGrid.appendChild(cell);
        }
    }
    
    // Function to create a calendar cell
    function createCalendarCell(day, isDisabled, isPast = false) {
        const cell = document.createElement('div');
        cell.classList.add('calendar-cell');
        cell.textContent = day;
        
        if (isDisabled || isPast) {
            cell.classList.add('disabled');
        } else {
            cell.addEventListener('click', () => selectDate(day));
        }
        
        return cell;
    }
    
    // Function to handle date selection
    function selectDate(day) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        selectedDateInput.value = selectedDate.toISOString().split('T')[0];
        
        // Update visual selection
        const cells = document.querySelectorAll('.calendar-cell');
        cells.forEach(cell => {
            cell.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
    }
    
    // Form submission handling
    const bookingForm = document.getElementById('booking-form');
    const modal = document.getElementById('confirmation-modal');
    const confirmEmail = document.getElementById('confirm-email');
    const confirmDate = document.getElementById('confirm-date');
    const closeModal = document.getElementById('close-modal');
    const closeBtn = document.querySelector('.close');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedDate) {
            alert('Please select a date for your cooking session');
            return;
        }
        
        const email = document.getElementById('email').value;
        
        // Format date for display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = selectedDate.toLocaleDateString('en-US', options);
        
        // Save to database (simulated with localStorage)
        saveToDatabase(email, selectedDate);
        
        // Send email using EmailJS
        sendMail(email, selectedDate);
        
        // Update modal content
        confirmEmail.textContent = email;
        confirmDate.textContent = formattedDate;
        
        // Show modal
        modal.style.display = 'flex';
    });
    
    // EmailJS function to send email
    function sendMail(email, date) {
        // Format the date for the email
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Set up parameters for EmailJS
        let parms = {
            selectedDate: formattedDate,
            email: email,
            to_email: email,
            reply_to: "noreply@sukunaskitchen.com",
            from_name: "Sukuna's Kitchen"
        };

        // Send email using EmailJS
        emailjs.send("service_uos6vhh", "template_u26dx3f", parms)
            .then(function(response) {
                console.log('Email successfully sent!', response.status, response.text);
                // The modal will already be shown from the form submission handler
            }, function(error) {
                console.error('Failed to send email:', error);
                alert('There was an error sending your confirmation email. Please contact us directly.');
            });
    }
    
    // Simulated database save function
    function saveToDatabase(email, date) {
        // Get existing bookings or initialize empty array
        const bookings = JSON.parse(localStorage.getItem('chefBookings') || '[]');
        
        // Add new booking
        bookings.push({
            email: email,
            date: date.toISOString(),
            bookedAt: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('chefBookings', JSON.stringify(bookings));
        
        console.log('Booking saved to database:', { email, date: date.toISOString() });
    }
    
    // Close modal events
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});