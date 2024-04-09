# Example of Integrating Kinde Authentication with an ASP.NET Core Web API Project and a React Client
This is an example of integrating [Kinde Authentication](https://www.kinde.com) with an ASPNET Core Web API Project and a React Client. The example demonstrates how to set up a Web API project and a React client with Kinde to provide the authentication.

First of all, create both a M2M application and a Front End application in Kinde. Create an API, and give the Front End application access to the API.

Note down the Client ID, Client Secrets, and API audience values for each.

While you're at it, create a Kinde user, add them to an Organization, give them a role and allocate some permissions. All this is covered in the Kinde docs.

## ASP.NET Core Web API Project
The Web API project is a simple project with a single controller that returns a list of values. The controller is protected by an Authorize attribute, so only authenticated users can access it.

Create it by using the Web API template in your IDE.

Add a reference to the latest version of ```Clinically.Kinde.Authentication``` from NuGet.

Add the following configuration section to your ```appSettings.json```:
```json 
{
  "Kinde": {
    "Authority": <YOUR_KINDE_DOMAIN>,
    "ManagementApiClientId" : <YOUR_M2M_APP_CLIENT_ID>,
    "ManagementApiClientSecret" : <YOUR_M2M_APP_CLIENT_ID>,
    "JwtAudience": <AUDIENCE_FOR_YOUR_API>
}
```

Add the following code to your ```Program.cs``` file:
```csharp
builder.Services.AddKindeJwtBearerAuthentication(builder.Configuration);
```

Now, add a CORS policy:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
```

Add the CORS policy and authorization before mapping any endpoints:
```csharp
app.UseAuthorization();
app.UseCors();
```

Finally, add an authorization requirement to the ```/weatherforecast``` endpoint:
```csharp
    ...
    .WithOpenApi()
    .RequireAuthorization();
```

## React Client
The React client uses the Kinde React starter kit. Follow the instructions in the README document in the starter kit to create your .env file and add the Kinde values for the Front End client application in Kinde.

Install the required npm packages:
```bash
npm install
```

Add the following line to your ```.env``` file:
```env
VITE_KINDE_AUDIENCE=<YOUR API AUDIENCE FROM KINDE>
```

You also have to add the audience to the ```KindeProvider``` in ```main.jsx```:
```jsx
<KindeProvider
    clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
    domain={import.meta.env.VITE_KINDE_DOMAIN}
    logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URL}
    redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URL}
    audience={import.meta.env.VITE_KINDE_AUDIENCE}
>
```

### Set up HTTPS
The Web API will always fail authorization without https when it is coming from another domain / port.

Also in the ```.env``` file, change the redirect URIs to point to https rather than http:
```env
VITE_KINDE_REDIRECT_URL=https://localhost:3000
VITE_KINDE_LOGOUT_URL=https://localhost:3000
``` 

Install the mkcert() plug by executing this inside the folder containing the React project:
```bash
npm i -D vite-plugin-mkcert
```

And now modify your ```vite.config.js``` file to use the mkcert plugin:
```javascript
import {defineConfig} from'vite'
import mkcert from'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [mkcert()]
})
```

Note, the first time you run your React app, you may be prompted for your administrator password to create a development certificate.

### Modify the app to call a protected API
Just as an example, modify the ```LoggedIn.jsx``` component to call the protected /weatherforecast API we created above.

```jsx
const [apiResponse, setApiResponse] = useState(null);
useEffect(() => {
    const token = getToken();
    fetch("http://localhost:7204/weatherforecast", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((res) => res.json())
    .then((data) => {setApiResponse(data)})
    .catch((err) => console.error(err));
}, [getToken]);
```

Note you have to update the port in the URL above to match the port your Web API is running on.

Now you can use the response from the API wherever you like. Output it somewhere on the page.

## Running
1. Start the Web API server.
2. Start the React client using ```npm start```.
3. Click the Sign In button and authenticate 
4. You should see the results from the WeatherForecast API
