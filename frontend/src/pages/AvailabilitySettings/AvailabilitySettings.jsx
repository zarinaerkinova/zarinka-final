import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './AvailabilitySettings.scss'
import { useUserStore } from '../../store/User'
import toast from 'react-hot-toast'

const AvailabilitySettings = forwardRef(({ userInfo }, ref) => {
	const { updateUserProfile } = useUserStore()

	const [workingHours, setWorkingHours] = useState({
		monday: { enabled: true, from: '09:00', to: '17:00' },
		tuesday: { enabled: true, from: '09:00', to: '17:00' },
		wednesday: { enabled: true, from: '09:00', to: '17:00' },
		thursday: { enabled: true, from: '09:00', to: '17:00' },
		friday: { enabled: true, from: '09:00', to: '17:00' },
		saturday: { enabled: true, from: '10:00', to: '16:00' },
		sunday: { enabled: false, from: '', to: '' },
	})

	const [orderSettings, setOrderSettings] = useState({
		maxOrders: 10,
		leadTime: 48,
		autoAccept: true,
		acceptOnlyWorkingDays: true,
	})

	const [vacationMode, setVacationMode] = useState(false)
	const [vacationDetails, setVacationDetails] = useState({
		reason: '',
		from: '',
		to: '',
	})

	const [unavailableDates, setUnavailableDates] = useState([])
	const [busyDates, setBusyDates] = useState([])

	useEffect(() => {
		if (userInfo) {
			if (userInfo.workingHours) {
				setWorkingHours(userInfo.workingHours);
			}
			if (userInfo.orderSettings) {
				setOrderSettings(userInfo.orderSettings);
			}
			if (userInfo.vacationMode) {
				setVacationMode(userInfo.vacationMode);
			}
			if (userInfo.vacationDetails) {
				setVacationDetails(userInfo.vacationDetails);
			}
			if (userInfo.unavailableDates) {
				setUnavailableDates(userInfo.unavailableDates.map(date => new Date(date)));
			}
			if (userInfo.busyDates) {
				setBusyDates(userInfo.busyDates.map(date => new Date(date)));
			}
		}
	}, [userInfo]);

	// Функция для проверки, является ли дата прошедшей
	const isPastDate = (date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const normalizedDate = new Date(date);
		normalizedDate.setHours(0, 0, 0, 0);
		return normalizedDate.getTime() < today.getTime();
	};

	const getStatus = date => {
		// Если дата прошедшая, не присваиваем ей статус
		if (isPastDate(date)) return 'past';
		
		const dateStr = date.getTime()
		if (unavailableDates.some(d => d.getTime() === dateStr))
			return 'unavailable'
		if (busyDates.some(d => d.getTime() === dateStr)) return 'busy'
		return 'available'
	}

	const handleDayClick = date => {
		// Блокируем клик по прошедшим датам
		if (isPastDate(date)) {
			return;
		}

		const dateExistsInBusy = busyDates.some(d => d.getTime() === date.getTime())
		const dateExistsInUnavailable = unavailableDates.some(
			d => d.getTime() === date.getTime()
		)

		if (!dateExistsInBusy && !dateExistsInUnavailable) {
			setBusyDates([...busyDates, date])
		} else if (dateExistsInBusy) {
			setBusyDates(busyDates.filter(d => d.getTime() !== date.getTime()))
			setUnavailableDates([...unavailableDates, date])
		} else if (dateExistsInUnavailable) {
			setUnavailableDates(
				unavailableDates.filter(d => d.getTime() !== date.getTime())
			)
		}
	}

	const removeDate = (date, type) => {
		if (type === 'busy') {
			setBusyDates(busyDates.filter(d => d.getTime() !== date.getTime()))
		} else {
			setUnavailableDates(
				unavailableDates.filter(d => d.getTime() !== date.getTime())
			)
		}
	}

	const handleSubmit = async () => {
		const formData = new FormData();

		formData.append('workingHours', JSON.stringify(workingHours));
		formData.append('orderSettings', JSON.stringify(orderSettings));
		formData.append('vacationMode', JSON.stringify(vacationMode));
		formData.append('vacationDetails', JSON.stringify(vacationDetails));
		formData.append('unavailableDates', JSON.stringify(unavailableDates.map(date => date.toISOString())));
		formData.append('busyDates', JSON.stringify(busyDates.map(date => date.toISOString())));

		try {
			await updateUserProfile(formData);
			toast.success('Availability settings updated successfully!');
		} catch (error) {
			console.error('Failed to update availability settings:', error);
			toast.error('Failed to update availability settings.');
		}
	};

	useImperativeHandle(ref, () => ({
		handleSubmit,
	}));

	return (
		<div className='availability-settings'>
			<h2>Availability Settings</h2>
			<p>Manage your working hours and availability calendar</p>

			<div className='settings-actions-top'>
				<button className='btn-primary' onClick={handleSubmit}>Save Settings</button>
			</div>

			{/* BLOCK 1 – Working Hours */}
			<div className='settings-section'>
				<h3>Working Hours</h3>
				{Object.keys(workingHours).map(day => (
					<div key={day} className='day-row'>
						<label>
							<input
								type='checkbox'
								checked={workingHours[day].enabled}
								onChange={() =>
									setWorkingHours({
										...workingHours,
										[day]: {
											...workingHours[day],
											enabled: !workingHours[day].enabled,
										},
									})
								}
							/>
							{day.charAt(0).toUpperCase() + day.slice(1)}
						</label>
						{workingHours[day].enabled ? (
							<>
								<input
									type='time'
									value={workingHours[day].from}
									onChange={e =>
										setWorkingHours({
											...workingHours,
											[day]: { ...workingHours[day], from: e.target.value },
										})
									}
								/>
								<span>to</span>
								<input
									type='time'
									value={workingHours[day].to}
									onChange={e =>
										setWorkingHours({
											...workingHours,
											[day]: { ...workingHours[day], to: e.target.value },
										})
									}
								/>
							</>
						) : (
							<span className='closed-text'>Close</span>
						)}
					</div>
				))}
			</div>
			<div className='block_1_2'>
				{/* BLOCK 2 – Order Settings */}
				<div className='settings-section max_order'>
					<h3>Order Settings</h3>
					<div className='form-group'>
						<label>Maximum Orders Per Day</label>
						<input
							type='number'
							value={orderSettings.maxOrders}
							onChange={e =>
								setOrderSettings({
									...orderSettings,
									maxOrders: e.target.value,
								})
							}
						/>
					</div>
					<div className='form-group'>
						<label>Lead Time (hours)</label>
						<input
							type='number'
							value={orderSettings.leadTime}
							onChange={e =>
								setOrderSettings({ ...orderSettings, leadTime: e.target.value })
							}
						/>
					</div>
					<div className='form-group checkbox'>
						<label>
							<input
								type='checkbox'
								checked={orderSettings.autoAccept}
								onChange={() =>
									setOrderSettings({
										...orderSettings,
										autoAccept: !orderSettings.autoAccept,
									})
								}
							/>
							Auto-accept orders
						</label>
					</div>
					<div className='form-group checkbox'>
						<label>
							<input
								type='checkbox'
								checked={orderSettings.acceptOnlyWorkingDays}
								onChange={() =>
									setOrderSettings({
										...orderSettings,
										acceptOnlyWorkingDays: !orderSettings.acceptOnlyWorkingDays,
									})
								}
							/>
							Accept orders only on working days
						</label>
					</div>
				</div>

				{/* BLOCK 3 – Vacation Mode */}
				<div className='settings-section vaca_mode'>
					<h3>Vacation Mode</h3>
					<div className='form-group checkbox'>
						<label>
							<input
								type='checkbox'
								checked={vacationMode}
								onChange={() => setVacationMode(!vacationMode)}
							/>
							Enable vacation mode (temporarily disable all orders)
						</label>
					</div>
					{vacationMode && (
						<div className='vacation-inputs'>
							<input
								type='text'
								placeholder='Reason'
								value={vacationDetails.reason}
								onChange={e =>
									setVacationDetails({
										...vacationDetails,
										reason: e.target.value,
									})
								}

							/>
							<input
								type='date'
								value={vacationDetails.from}
								onChange={e =>
									setVacationDetails({
										...vacationDetails,
										from: e.target.value,
									})
								}
							/>
							<input
								type='date'
								value={vacationDetails.to}
								onChange={e =>
									setVacationDetails({ ...vacationDetails, to: e.target.value })
								}
							/>
						</div>
					)}
				</div>
			</div>
			{/* CALENDAR */}
			<div className='calendar-section'>
				<div className='calendar-legend'>
					<span className='legend-item available'>Available</span>
					<span className='legend-item busy'>Busy</span>
					<span className='legend-item unavailable'>Unavailable</span>
				</div>

				<div className='calendar-container'>
					<Calendar
						onClickDay={handleDayClick}
						tileDisabled={({ date, view }) => view === 'month' && isPastDate(date)}
						tileClassName={({ date, view }) => {
								let classes = [];
								if (view === 'month') {
									classes.push(getStatus(date));
									const today = new Date();
									today.setHours(0, 0, 0, 0);
									const normalizedDate = new Date(date);
									normalizedDate.setHours(0, 0, 0, 0);

									if (normalizedDate.getTime() === today.getTime()) {
										classes.push('today');
									} else if (normalizedDate.getTime() < today.getTime()) {
										classes.push('past-date');
									}
								}
								return classes.join(' ');
							}}
					/>
				</div>
			</div>

			{/* Lists */}
			<div className='date-lists'>
				<div>
					<h4>Unavailable Dates</h4>
					<ul>
						{unavailableDates.map(d => (
							<li key={d.toISOString()}>
								{d.toLocaleDateString()}{' '}
								<span onClick={() => removeDate(d, 'unavailable')}>Remove</span>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h4>Busy Dates</h4>
					<ul>
						{busyDates.map(d => (
							<li key={d.toISOString()}>
								{d.toLocaleDateString()}{' '}
								<span onClick={() => removeDate(d, 'busy')}>Remove</span>
							</li>
						))}
					</ul>
				</div>

			</div>

			<div className='settings-actions-bottom'>
				<button className='btn-primary' onClick={handleSubmit}>Save All Settings</button>
			</div>
		</div>
	)
});

export default AvailabilitySettings