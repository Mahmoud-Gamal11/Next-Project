
        let checkInData = null;

        function formatTime(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        function formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString();
        }
        function getStatus(checkInDate) {
            const d = new Date(checkInDate);
            const hour = d.getHours();
            if (hour >= 8 && hour < 9) return 'Present';
            if (hour >= 9 && hour < 10) return 'Late';
            return 'Absent';
        }
        function getStatusClass(status) {
            if (status === 'Present') return 'status-present';
            if (status === 'Late') return 'status-late';
            return 'status-absent';
        }
        function getLocation(callback) {
            if (!navigator.geolocation) {
                callback('Not Supported');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    callback(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                },
                () => callback('Unavailable'),
                { enableHighAccuracy: true, timeout: 7000 }
            );
        }
        function saveAttendanceRecord(record) {
            let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
            // لو الموظف سجل قبل كده ومخلصش check out، حدث السطر بدل ما تضيف جديد
            const idx = records.findIndex(r => r.name === record.name && !r.checkOut);
            if (idx !== -1) {
                records[idx] = record;
            } else {
                records.push(record);
            }
            localStorage.setItem('attendanceRecords', JSON.stringify(records));
        }
        function renderInfo() {
            document.getElementById('nameCell').textContent = checkInData ? checkInData.name : '';
            document.getElementById('checkInCell').textContent = checkInData && checkInData.checkIn ? 
                formatDate(checkInData.checkIn) + ' ' + formatTime(checkInData.checkIn) : '';
            document.getElementById('locationCell').textContent = checkInData ? checkInData.location || '' : '';
            document.getElementById('checkOutCell').textContent = checkInData && checkInData.checkOut ?
                formatDate(checkInData.checkOut) + ' ' + formatTime(checkInData.checkOut) : '';
            document.getElementById('statusCell').innerHTML = checkInData && checkInData.status ?
                `<span class="${getStatusClass(checkInData.status)}">${checkInData.status}</span>` : '';
        }
        document.getElementById('checkInBtn').onclick = function() {
            const name = document.getElementById('employeeName').value.trim();
            if (!name) {
                alert('Please enter your name.');
                return;
            }
            if (checkInData && checkInData.checkIn && !checkInData.checkOut) {
                alert('You have already checked in.');
                return;
            }
            getLocation(location => {
                const now = new Date();
                const status = getStatus(now);
                checkInData = {
                    name,
                    checkIn: now,
                    location,
                    checkOut: null,
                    status: status,
                    workHours: ''
                };
                saveAttendanceRecord(checkInData);
                document.getElementById('employeeName').disabled = true;
                document.getElementById('checkInBtn').disabled = true;
                document.getElementById('checkOutBtn').disabled = false;
                renderInfo();
            });
        };
        document.getElementById('checkOutBtn').onclick = function() {
            if (!checkInData || !checkInData.checkIn || checkInData.checkOut) return;
            checkInData.checkOut = new Date();
            // حساب عدد ساعات العمل
            const diffMs = new Date(checkInData.checkOut) - new Date(checkInData.checkIn);
            if (diffMs > 0) {
                const hours = Math.floor(diffMs / 3600000);
                const mins = Math.floor((diffMs % 3600000) / 60000);
                checkInData.workHours = `${hours}h ${mins}m`;
            }
            saveAttendanceRecord(checkInData);
            document.getElementById('checkOutBtn').disabled = true;
            renderInfo();
        };
        // Reset on page load
        document.getElementById('employeeName').disabled = false;
        document.getElementById('checkInBtn').disabled = false;
        document.getElementById('checkOutBtn').disabled = true;
        renderInfo();
    
       

    