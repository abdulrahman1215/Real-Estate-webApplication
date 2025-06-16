import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import Spinner from '../components/Spinner';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'sale',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 1000,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch(() => {
          setImageUploadError('Image upload failed (2 MB max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    const updatedUrls = [...formData.imageUrls];
    updatedUrls.splice(index, 1);
    setFormData({ ...formData, imageUrls: updatedUrls });
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (id === 'sale' || id === 'rent') {
        setFormData({ ...formData, type: id });
      } else {
        setFormData({ ...formData, [id]: checked });
      }
    } else {
      setFormData({ ...formData, [id]: type === 'number' ? Number(value) : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) {
        return setError('You must upload at least one image');
      }
      if (formData.regularPrice < formData.discountPrice) {
        return setError('Discount price must be less than regular price');
      }

      setLoading(true);
      setError(false);

      const formDataCopy = {
        ...formData,
        timestamp: serverTimestamp(),
        userRef: currentUser.uid,
      };

      const docRef = doc(db, 'listings', params.listingId);
      await updateDoc(docRef, formDataCopy);
      setLoading(false);
      navigate(`/listing/${docRef.id}`);
    } catch (error) {
      setError('Could not update listing');
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Update Listing</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-300 p-3 rounded-md shadow-sm"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border border-gray-300 p-3 rounded-md shadow-sm resize-none"
            id="description"
            rows="4"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border border-gray-300 p-3 rounded-md shadow-sm"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'sale', label: 'Sell' },
              { id: 'rent', label: 'Rent' },
              { id: 'parking', label: 'Parking Spot' },
              { id: 'furnished', label: 'Furnished' },
              { id: 'offer', label: 'Offer' },
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={id}
                  onChange={handleChange}
                  className="h-5 w-5 accent-slate-600"
                  checked={id === 'sale' || id === 'rent'
                    ? formData.type === id
                    : formData[id]}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bedrooms}
                className="p-2 border rounded-md w-20"
              />
              Beds
            </label>
            <label className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bathrooms}
                className="p-2 border rounded-md w-20"
              />
              Baths
            </label>
            <label className="flex flex-col gap-1">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                onChange={handleChange}
                value={formData.regularPrice}
                className="p-2 border rounded-md"
              />
              <span className="text-sm text-gray-500">
                Regular Price {formData.type === 'rent' && '($ / month)'}
              </span>
            </label>
            {formData.offer && (
              <label className="flex flex-col gap-1 col-span-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  onChange={handleChange}
                  value={formData.discountPrice}
                  className="p-2 border rounded-md"
                />
                <span className="text-sm text-gray-500">
                  Discount Price {formData.type === 'rent' && '($ / month)'}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-4">
          <p className="font-medium text-lg">
            Images{' '}
            <span className="text-sm font-normal text-gray-600">
              (first image will be cover, max 6)
            </span>
          </p>
          <div className="flex gap-2">
            <input
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="p-2 border border-gray-300 rounded-md flex-1"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-70"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUploadError && (
            <p className="text-red-600 text-sm">{imageUploadError}</p>
          )}
          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {formData.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative rounded overflow-hidden border shadow-sm"
                >
                  <img
                    src={url}
                    alt="listing"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            disabled={loading || uploading}
            className="w-full py-3 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Listing'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
