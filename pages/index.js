import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Scriptorium</h1>
      <p>Choose an option below to get started:</p>
      <div style={{ marginTop: '20px' }}>
        <Link href="/signup">
          <button style={{ margin: '10px', padding: '10px 20px' }}>Sign Up</button>
        </Link>
        <Link href="/login">
          <button style={{ margin: '10px', padding: '10px 20px' }}>Log In</button>
        </Link>
        
      </div>
    </div>
  );
}
