import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;
    if (['all', 'rent', 'sale'].includes(id)) {
      setSidebardata({ ...sidebardata, type: id });
    } else if (id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: value });
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setSidebardata({ ...sidebardata, [id]: checked });
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    Object.entries(sidebardata).forEach(([key, val]) => urlParams.set(key, val));
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const startIndex = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) setShowMore(false);
    setListings((prev) => [...prev, ...data]);
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <aside className='p-7 border-b-2 md:border-r-2 md:min-h-screen w-full md:w-1/4 bg-gray-50'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <div>
            <label className='font-semibold'>Search Term</label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border rounded-lg p-2 w-full mt-1'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Type</p>
            {['all', 'rent', 'sale'].map((type) => (
              <label key={type} className='flex gap-2 items-center'>
                <input
                  type='checkbox'
                  id={type}
                  onChange={handleChange}
                  checked={sidebardata.type === type}
                />
                <span className='capitalize'>{type}</span>
              </label>
            ))}
          </div>
          <div className='space-y-2'>
            <p className='font-semibold'>Amenities</p>
            {['parking', 'furnished'].map((amenity) => (
              <label key={amenity} className='flex gap-2 items-center'>
                <input
                  type='checkbox'
                  id={amenity}
                  onChange={handleChange}
                  checked={sidebardata[amenity]}
                />
                <span className='capitalize'>{amenity}</span>
              </label>
            ))}
          </div>
          <label className='flex gap-2 items-center font-semibold'>
            <input
              type='checkbox'
              id='offer'
              onChange={handleChange}
              checked={sidebardata.offer}
            />
            Offer
          </label>
          <div>
            <label className='font-semibold'>Sort By</label>
            <select
              id='sort_order'
              className='border p-2 rounded-lg w-full mt-1'
              onChange={handleChange}
              defaultValue='created_at_desc'
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to high</option>
              <option value='created_at_desc'>Newest</option>
              <option value='created_at_asc'>Oldest</option>
            </select>
          </div>
          <button className='bg-slate-700 text-white rounded-lg py-2 hover:opacity-95'>
            Search
          </button>
        </form>
      </aside>
      <main className='flex-1 p-5'>
        <h1 className='text-3xl font-bold text-slate-700 mb-4'>Listing Results</h1>
        <div className='flex flex-wrap gap-5'>
          {loading ? (
            <p className='text-lg'>Loading...</p>
          ) : listings.length === 0 ? (
            <p className='text-lg'>No listing found!</p>
          ) : (
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))
          )}
        </div>
        {showMore && (
          <button
            onClick={onShowMoreClick}
            className='mt-6 text-green-700 underline text-lg'
          >
            Show more
          </button>
        )}
      </main>
    </div>
  );
}
