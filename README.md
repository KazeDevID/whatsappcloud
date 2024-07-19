# whatsappcloud

This library will make it easier for you to create WhatsApp bots, and it is official because of the WhatsApp cloud api framework.


<br/>

The <b>easiest</b>, most intuitive way for <b>businesses</b> and <b>developers</b> to start building on the <b>Whatsapp Cloud API</b>.

- Send a free-formatted text message to a recipient
- Generate a QR code which can be scanned by a recipient
- Parse incoming messages


### Frequently Asked Questions:

-   What is WhatsApp Cloud API? [Watch this 60seconds video](https://www.youtube.com/watch?v=LaHnC7emQNM) during the launch Whatsapp Cloud API.
-   What is this package? This package is an unofficial and _open-source_ NodeJS wrapper around the official [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).
-   Why is this package useful? Because it allows you to use the WhatsApp Cloud API without having to write a lot of code.
-   Can I use this package in my project? Yes, you can use it however you want.
-   Can I contribute to this package? Yes, you can contribute to this package by creating a pull request.

### Installation:

-   To install this package in your project:
-   Using NPM:

```js
        npm install whatsappcloud
```

-   Using Yarn:

```js
        yarn add whatsappcloud
```

# Usage:

-   First import the package as follows:

```js
const WhatsAppClient = require('whatsappcloud');
```

-   Then initialize the class as follows:

```js
const conn = new WhatsAppClient({
    accessToken: 'Your access token here',
    senderPhoneNumberId: 'Your sender phone number id here',
    WABA_ID: 'Your Whatsapp Business Account id here',
});
```

#### Send a free-formatted text message to a recipient:

```js
await conn.sendText({
    message: 'Hello world',
    recipientPhone: 'your recipient phone number here',
});
```

    > Quick Question:
    - How does a recipient phone number look like?

    > Quick Answer:
    - A recipient phone number is the international phone number of the recipient without the '+' prefix.
    - For example, where a Kenyan phone number is '+123456789' we would send the message to a recipientPhone 123456789.
    - For a phone number +123456789 we would send the message to a recipientPhone 12345678888.
    - For an US phone number +1 555-555-5555 we would send the message to a recipientPhone 5555555555.

    Makes sense?


##### Generate a QR code which can be scanned by a recipient:

```js
let result = await conn.createQRCodeMessage({
    message: `Your QR code message here. I am a message hidden in a QR code.`,
    imageType: 'png' || 'svg',
});

let urlOfImage = result.data.qr_image_url;
```

See the image below on how to display the QR code: <br/>
<img src="./img/exampleQr.png"
    alt="Markdown Monster icon"
    style="height:250px;width:250px" />
<br/>


#### Parse incoming messages:

```js
// req.body is the body of the request which ping the webhook. Invalid payloads will throw an error, and you should respond with HTTP status 5** or 4**, not 200.
// remember to respond with HTTP 200 status at the end of a succesful inbound request.
let data = conn.parseMessage(req.body);
/*
data.isMessage will be true if it is a message from a customer, it will be false otherwise.
data.isNotificationMessage will be true if it is a notification from a Meta(e.g a message delivery/read status notification), it will be false otherwise.
data will throw an error if the body of the webhook request is not valid or not from Meta.
*/
```
