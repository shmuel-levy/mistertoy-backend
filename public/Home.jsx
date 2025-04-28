import img from "/images/toys-store-banner.jpeg";



export function Home() {
    return (
      <section className="home">
        <h1>Welcome to Mister Toy</h1>
        <p>Your one-stop shop for amazing toys!</p>
        <div className="home-banner">
          <img src={img} />
        </div>
        <div className="home-info">
          <h2>Why Choose Mister Toy?</h2>
          <div className="features">
            <div className="feature">
              <h3>Quality Toys</h3>
              <p>We offer the best quality toys from around the world.</p>
            </div>
            <div className="feature">
              <h3>Great Prices</h3>
              <p>Competitive prices on all our products.</p>
            </div>
            <div className="feature">
              <h3>Fast Shipping</h3>
              <p>Quick delivery to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }