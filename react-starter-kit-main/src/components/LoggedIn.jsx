import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {useEffect, useState} from "react";

export default function LoggedIn() {
  const { user, logout, getToken } = useKindeAuth();
  // Get the auth token from Kinde and store it in the token variable
  // After that, call the protected API using the authorization token
  const [apiResponse, setApiResponse] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const token = await getToken();

      fetch("https://localhost:7204/weatherforecast", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
          .then((res) => res.json())
          .then((data) => {
            setApiResponse(data); // Store the response in the state variable
          })
          .catch((err) => console.error(err));
    }

    fetchData();
  }, [getToken])

  return (
    <>
      <header>
        <nav className="nav container">
          <h1 className="text-display-3">KindeAuth</h1>
          <div className="profile-blob">
            {user.picture !== "" ? (
              <img
                className="avatar"
                src={user.picture}
                alt="user profile avatar"
              />
            ) : (
              <div className="avatar">
                {user?.given_name?.[0]}
                {user?.family_name?.[1]}
              </div>
            )}
            <div>
              <p className="text-heading-2">
                {user?.given_name} {user?.family_name}
              </p>
              <button className="text-subtle" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="container">
          <div className="card start-hero">
            <p className="text-body-2 start-hero-intro">Woohoo!</p>
          </div>
          <section className="next-steps-section">
              <ul>
                {apiResponse
                    ? apiResponse.map((item, index) => (
                        <li key={index}>
                          Date: {item.date} <br/>
                          Temperature: {item.temperatureC}<br/>
                          Summary: {item.summary}<br/><br/>
                        </li>
                    ))
                    : "Loading..."
                }
              </ul>
           </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <strong className="text-heading-2">KindeAuth</strong>
          <p className="footer-tagline text-body-3">
            Visit our{" "}
            <a className="link" href="https://kinde.com/docs">
              help center
            </a>
          </p>

          <small className="text-subtle">
            © 2023 KindeAuth, Inc. All rights reserved
          </small>
        </div>
      </footer>
    </>
  );
}
