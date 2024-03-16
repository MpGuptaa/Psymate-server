const generateAssessmentTemplate = (content) => {
    const {
        patientName,
        patientNumber,
        patientEmail,
        appointmentId,
        appointmentDate,
        assessmentName
    } = content;

    return `
        <!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

        <head>
            <title></title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Mada:wght@400;500&display=swap" rel="stylesheet">
            <style>
                *,
                *::before,
                *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: inherit;
                }

                html {
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Mada', sans-serif;
                    font-size: 16px;
                }

                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }

                .email {
                    background-color: #ffffff;
                    -webkit-text-size-adjust: none;
                    text-size-adjust: none;
                    padding: 20px 0;
                }

                .email__container {
                    background-color: #f9f9f9;
                    margin: 0 auto;
                    width: 550px;
                    max-width: 95%;
                    padding-bottom: 50px;
                }

                /* HEADER */
                header {
                    padding: 30px 0 20px 0;
                }

                header img:not(:last-child) {
                    margin-bottom: 30px;
                }

                header img {
                    margin: 0 auto;
                    display: block;
                }

                .email__p {
                    max-width: 80%;
                    margin: 0 auto;
                    color: #7c7c7c;
                    font-size: 14px;
                    line-height: 152%;
                    margin-bottom: 15px;
                }

                .email__cta {
                    align-self: flex-start;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 162%;
                    letter-spacing: 1px;
                    color: #ffffff;
                    background: #F8B133;
                    border-radius: 4px;
                    padding: 6px 20px;
                    margin-bottom: 30px;
                    margin-top: 5px;
                    display: inline-block;
                }

                .center_content {
                    text-align: center;
                }

                .separator {
                    max-width: 80%;
                    margin: 10px auto;
                    border-bottom: 1px solid #f0f0f0;
                }

                .table td {
                    padding: 10px 30px;
                    background-color: white;
                }

                .table__detail {
                    font-weight: 500;
                    color: black;
                }

                .table__paid {
                    font-weight: 500;
                    color: green;
                    display: inline-block;
                    padding: 4px 14px;
                    margin-left: 10px;
                    border-radius: 5px;
                    background-color: rgb(214, 255, 214);
                }

                footer {
                    margin-top: 20px;
                }

                .footer__socials {
                    max-width: 80%;
                    margin: 0 auto;
                    display: flex;
                }

                .footer__social {
                    display: inline-block;
                    margin-right: 10px;
                }

                @media only screen and (max-width: 480px) {
                    .email__p {
                        max-width: 90%;
                    }

                    .email__misc {
                        max-width: 90%;
                    }

                    .table td {
                        padding: 15px 15px;
                    }

                    .table__email {
                        font-size: 12px;
                    }
                }
            </style>
        </head>

        <body class="email">
            <div class="email__container">
                <header class="email__header">
                    <img 
                        src="https://iili.io/hgTI5v.png" 
                        alt="PRIXLED" 
                        class="email__logo"
                        height="55.5"
                        width="160"
                        title="Logo"
                    >
                </header>
                <main>
                    <p class="email__p">
                        Assessment Confirmation through our exclusive portal. 
                    </p>
                    <p class="email__p">
                        Here are the Assessments details:
                    </p>

                    <div class="email__p">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Patient Name</td>
                                    <td class="table__detail">${patientName}</td>
                                </tr>
                                <tr>
                                    <td>Date</td>
                                    <td class="table__detail">${appointmentDate}</td>
                                </tr>
                                <tr>
                                    <td>Patient Phone number and Email ID</td>
                                    <td>
                                        <span>${patientNumber}</span>
                                        <a class="table__email" href="mailto:${patientEmail}">${patientEmail}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Appointment ID</td>
                                    <td class="table__detail">
                                        <span>${appointmentId}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Appointment Name</td>
                                    <td class="table__detail">
                                        <span>${assessmentName}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Payment Status</td>
                                    <td class="table__detail">
                                        <span class="table__paid">PAID</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p class="email__p">
                        Please Note: This is a Cashless Appointment. Please show this reciept or invoice at the clinic when you visit for your appointment.
                    </p>
                </main>
                <div class="separator"></div>
                <footer>
                    <div class="footer__socials">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" >
                                    <div class=" footer__social">
                                        <a href="https://www.instagram.com/psymatehealthcare/">
                                            <img 
                                                src="https://iili.io/hgTDpR.md.png" 
                                                alt="instagram" 
                                                width="24" 
                                                title="instagram"
                                            >
                                        </a>
                                    </div>
                                    <div class=" footer__social">
                                        <a href="https://twitter.com/psymatehealthcr">
                                        <img 
                                            src="https://iili.io/hgufp4.md.png" 
                                            alt="twitter" 
                                            width="24" 
                                            title="twitter"
                                        >
                                        </a>
                                    </div>
                                    <div class=" footer__social">
                                        <a href="https://www.linkedin.com/in/psymate-healthcare-851377202/">
                                        <img 
                                            src="https://iili.io/hgTZYJ.md.png" 
                                            alt="linkedin" 
                                            width="24" 
                                            title="linkedin"
                                        >
                                        </a>
                                    </div>
                                    <div class=" footer__social">
                                        <a href="https://www.facebook.com/psymatehealthcr/">
                                        <img 
                                            src="https://iili.io/hgTtkv.md.png" 
                                            alt="facebook" 
                                            width="24" 
                                            title="facebook"
                                        >
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </footer>
            </div>
        </body>

        </html>
    `;
};

module.exports = { generateAssessmentTemplate };
