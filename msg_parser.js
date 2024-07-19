'use strict';

module.exports = ({ requestBody, currentWABA_ID }) => {
    if (!requestBody) {
        throw new Error('"requestBody" is required');
    }

    if (!currentWABA_ID) {
        throw new Error(
            'currentWABA_ID is required. This is the business ID that you have configured in your WABA account.'
        );
    }

    let WABA_ID = requestBody.entry[0]?.id;
    if (WABA_ID == 0) {
        signale.warn({
            message:
                "WABA_ID is 0. You seem to be testing with Meta test subscription. This is not really a valid WABA_ID. I recommend you to send an actual message from an actual whatsapp customer's number.",
        });
    }

    if (!WABA_ID || WABA_ID !== currentWABA_ID) {
        throw new Error(
            'WABA_ID is not valid. Hint: the message is not intended for this Whatsapp Business Account.'
        );
    }

    if (
        !requestBody.object ||
        requestBody.object !== 'whatsapp_business_account'
    ) {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "object" property'
        );
    }

    if (!requestBody.entry || !requestBody.entry?.length) {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "entry" property'
        );
    }

    if (
        !requestBody.entry[0].changes?.length ||
        requestBody.entry[0].changes[0].field !== 'messages'
    ) {
        throw new Error(
            'requestBody is not a valid whatsapp message. Hint: check the "changes" property'
        );
    }

    let metadata = requestBody.entry[0].changes[0].value.metadata;
    let contacts = requestBody.entry[0].changes[0].value.contacts?.length
        ? requestBody.entry[0].changes[0].value.contacts[0]
        : null;

    // Messages vs Notifications
    let message = requestBody.entry[0].changes[0].value?.messages
        ?.filter((msg) => msg.type === 'text') // get text messages
        .length
        ? requestBody.entry[0].changes[0].value.messages.filter(
              (msg) => msg.type === 'text'
          )[0]
        : null;

    // format response object
    const output = {
        metadata,
        contacts,
        WABA_ID,
        isMessage: !!message,
        isNotificationMessage: !message, 
        message: message
            ? {
                  // only add message information if it exists
                  body: message.text?.body || '', 
                  message_id: message.id || null,
                  from: {
                      name: contacts?.profile.name || null,
                      phone: message?.from || null,
                  },
              }
            : null,
    };

    return output;
};