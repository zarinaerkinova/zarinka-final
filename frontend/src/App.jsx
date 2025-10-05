import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Footer from './components/Footer/Footer.jsx'
import LoadingBar from './components/LoadingBar/LoadingBar.jsx' // Import LoadingBar
import Navbar from './components/Navbar/Navbar.jsx'
import OnlyAdmins from './components/OnlyAdmins.jsx'
import OnlyAuthorized from './components/OnlyAuthorized/OnlyAuthorized.jsx'
import AddProduct from './pages/AddProduct/AddProduct.jsx'
import AllOrders from './pages/AllOrders/AllOrders.jsx'
import Auth from './pages/Auth/Auth.jsx'
import AvailabilitySettings from './pages/AvailabilitySettings/AvailabilitySettings.jsx'
import BakerDashboard from './pages/BakerDashboard/BakerDashboard.jsx'
import BakerDetail from './pages/BakerDetail/BakerDetail.jsx'
import BakerReviews from './pages/BakerReviews/BakerReviews.jsx'
import BakerOrders from './pages/Bakers/BakerOrders.jsx'
import Bakers from './pages/BakersPage/BakersPage.jsx'
import CakeDetails from './pages/CakeDetails/CakeDetails.jsx'
import Cakes from './pages/Cakes/Cakes.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import CompletedOrders from './pages/CompletedOrders/CompletedOrders.jsx'
import Contact from './pages/Contact/Contact.jsx'
import Custom from './pages/Custom/Custom.jsx'
import EditProduct from './pages/EditProduct/EditProduct.jsx'
import EditProfile from './pages/EditProfile/EditProfile.jsx'
import Favorite from './pages/Favorite/Favorite.jsx'
import Help from './pages/Help/Help.jsx'
import Home from './pages/Home/Home.jsx'
import MyOrders from './pages/MyOrders/MyOrders.jsx'
import NewOrders from './pages/NewOrders/NewOrders.jsx'
import Notifications from './pages/Notifications/Notifications.jsx'
import ProductList from './pages/ProductList/ProductList.jsx' // Import new component
import Profile from './pages/Profile/Profile.jsx'
import ProfileSettings from './pages/ProfileSettings/ProfileSettings.jsx'
import ReviewSubmission from './pages/ReviewSubmission/ReviewSubmission.jsx' // Import ReviewSubmission

function App() {
	const location = useLocation() // Add useLocation hook

	return (
		<div className='App'>
			<Navbar />
			<LoadingBar /> {/* Add LoadingBar here */}
			<div key={location.pathname} className='page-transition-container'>
				{' '}
				{/* Add key and class */}
				<Routes>
					<Route path='/' element={<Home />} />

					<Route
						path='/cakes'
						element={
							// <OnlyUsers>
							<Cakes />
							// </OnlyUsers>
						}
					/>
					<Route path='/cakes/:productId' element={<CakeDetails />} />
					<Route path='/product/:productId' element={<CakeDetails />} />
					<Route
						path='/bakers'
						element={
							// <OnlyUsers>
							<Bakers />
							// </OnlyUsers>
						}
					/>
					<Route
						path='/bakers/:bakerId'
						element={
							// <OnlyUsers>
							<BakerDetail />
							// </OnlyUsers>
						}
					/>
					<Route path='/cart' element={<Cart />} />
					<Route path='/favorite' element={<Favorite />} />
					<Route path='/help' element={<Help />} />
					<Route path='/contact' element={<Contact />} />
					<Route path='/checkout' element={<Checkout />} />
					<Route path='/my-orders' element={<MyOrders />} />
					<Route path='/baker-orders' element={<BakerOrders />} />
					<Route path='/notifications' element={<Notifications />} />
					<Route path='/baker/reviews' element={<BakerReviews />} />
					<Route path='/all-orders' element={<AllOrders />} />

					<Route
						path='/addproduct'
						element={
							<OnlyAdmins>
								<AddProduct />
							</OnlyAdmins>
						}
					/>
					<Route
						path='/manage-products'
						element={
							<OnlyAdmins>
								<BakerDashboard />
							</OnlyAdmins>
						}
					/>
					<Route
						path='/product-list'
						element={
							<OnlyAdmins>
								<ProductList />
							</OnlyAdmins>
						}
					/>
					<Route
						path='/edit-product/:productId'
						element={
							<OnlyAdmins>
								<EditProduct />
							</OnlyAdmins>
						}
					/>
					<Route
						path='/baker/orders/new'
						element={
							<OnlyAdmins>
								<NewOrders />
							</OnlyAdmins>
						}
					/>
					<Route
						path='/baker/orders/completed'
						element={
							<OnlyAdmins>
								<CompletedOrders />
							</OnlyAdmins>
						}
					/>

					<Route path='/register' element={<Auth />} />
					<Route
						path='/profile'
						element={
							<OnlyAuthorized>
								<Profile />
							</OnlyAuthorized>
						}
					/>
					<Route
						path='/edit-profile'
						element={
							<OnlyAuthorized>
								<EditProfile />
							</OnlyAuthorized>
						}
					/>
					<Route
						path='/settings'
						element={
							<OnlyAuthorized>
								<ProfileSettings />
							</OnlyAuthorized>
						}
					/>
					<Route
						path='/availability'
						element={
							<OnlyAuthorized>
								<AvailabilitySettings />
							</OnlyAuthorized>
						}
					/>
					<Route path='/custom' element={<Custom />} />
					<Route path='/review/:orderId' element={<ReviewSubmission />} />
				</Routes>
			</div>
			<Footer />
			<Toaster position='top-right' reverseOrder={false} />
		</div>
	)
}

export default App
