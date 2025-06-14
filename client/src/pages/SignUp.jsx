import {Link}  from 'react-router-dom';

export default function SignUp() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          required
        />
        
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>
          Already have an account?
        </p>
        <Link to={'/sign-in'}>
        <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
    </div>
  );
}
