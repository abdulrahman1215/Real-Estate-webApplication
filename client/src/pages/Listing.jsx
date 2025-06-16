import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  return (
    <main className="bg-gray-50 min-h-screen">
      {loading && <p className='text-center py-10 text-xl font-semibold text-gray-600'>Loading...</p>}
      {error && (
        <p className='text-center py-10 text-xl font-semibold text-red-600'>Something went wrong!</p>
      )}

      {listing && !loading && !error && (
        <div className="max-w-6xl mx-auto p-4">
          {/* Swiper Images */}
          <div className="rounded-xl overflow-hidden shadow-md mb-6 relative">
            <Swiper navigation>
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <div
                    className="h-[500px] bg-center bg-cover"
                    style={{ backgroundImage: `url(${url})` }}
                  ></div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="absolute top-4 right-4 z-10 bg-white rounded-full shadow p-2 cursor-pointer">
              <FaShare
                className="text-gray-600"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            </div>
            {copied && (
              <p className='absolute top-16 right-5 z-10 bg-white px-4 py-2 rounded shadow text-sm text-gray-700'>
                Link copied!
              </p>
            )}
          </div>

          {/* Details */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-2">
              {listing.name}{' '}
              <span className="text-green-600">
                - $
                {listing.offer
                  ? listing.discountPrice.toLocaleString('en-US')
                  : listing.regularPrice.toLocaleString('en-US')}
                {listing.type === 'rent' && ' / month'}
              </span>
            </h1>
            <p className="text-gray-600 flex items-center gap-2 text-sm mb-4">
              <FaMapMarkerAlt className='text-green-500' />
              {listing.address}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              {listing.offer && (
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                  ${+listing.regularPrice - +listing.discountPrice} OFF
                </span>
              )}
            </div>

            <p className='text-gray-800 mb-4'>
              <span className='font-semibold'>Description: </span>
              {listing.description}
            </p>

            <ul className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-green-900 font-medium text-sm'>
              <li className='flex items-center gap-2'>
                <FaBed className='text-lg' />
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : '1 Bed'}
              </li>
              <li className='flex items-center gap-2'>
                <FaBath className='text-lg' />
                {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : '1 Bath'}
              </li>
              <li className='flex items-center gap-2'>
                <FaParking className='text-lg' />
                {listing.parking ? 'Parking Available' : 'No Parking'}
              </li>
              <li className='flex items-center gap-2'>
                <FaChair className='text-lg' />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>

            {/* Contact Button */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="mt-6 bg-slate-800 text-white w-full py-3 rounded-lg uppercase hover:bg-slate-900 transition"
              >
                Contact Landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
