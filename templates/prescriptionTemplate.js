const prescriptionTemplate = (content) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Prescription</title>
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
  
        html {
          box-sizing: border-box;
        }
  
        body {
          margin: 0;
          padding: 20px;
          font-family: "Roboto", sans-serif;
          display: flex;
          height: 96vh;
          width: 96vw;
          flex-direction: column;
          justify-content: space-between;
        }

        .header {
          font-size: 30px;
          border-bottom: 2px solid #f8b133;
          padding-bottom: 30px;
          margin-bottom: 30px;
          /* width: 100%; */
  
          /* margin-bottom: 100px; */
        }
  
        .footer {
          color: rgb(8, 6, 6);
          text-align: center;
          background-color: rgb(218, 216, 214);
          padding: 10px;
        }
  
        .position {
          display: flex;
          justify-content: space-between;
          /* justify-content: center; */
        }
  
        .dnone {
          text-align: center;
          display: flex;
          /* align-items: center; */
          flex-direction: column;
          justify-content: center;
          align-content: space-between;
        }
  
        a {
          text-decoration: none;
          color: black; /* Change the color to your preferred color */
        }
  
        .closer {
          align-items: end;
        }
  
        .itemend {
          display: flex;
          justify-content: flex-end;
        }
  
        .fourd {
          padding: 3px;
          box-sizing: border-box;
          border: 2px solid rgb(35, 35, 35);
          border-left: 1px solid rgb(35, 35, 35);
          border-right: 1px solid rgb(35, 35, 35);
          width: 100%;
          padding: 3px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
  
        .pstyle {
          font-size: 10px;
          margin: 3px 0px;
        }
  
        th,
        td {
          text-align: left;
          font-weight: normal;
          font-size: 10px;
          margin-left: 3px;
          padding-bottom: 5px;
          line-height: 8px;
        }
  
        th {
          padding-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-bottom: 30px;
        }
  
        .secfooter {
          border-top: 2px solid #f8b133;
          border-bottom: 2px solid #f8b133;
        }
  
        .alicon {
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: center;
        }
  
        .dend {
          align-items: center;
          text-align: end;
          display: flex;
          flex-direction: column;
          justify-content: center;
          /* line-height: 10px; */
        }
  
        .itemend {
          display: flex;
          flex-direction: column;
        }
  
        .pleft {
          padding-left: 5px;
        }
  
        /* p{
                    margin: 5px 0px;
                    line-height: 25px;
                } */
  
        .br {
          border-radius: 25px;
          border: 2px solid black;
          padding: 3px;
        }
  
        h5 {
          font-size: 40px;
          margin: 10px 0px;
        }
  
        h2 {
          margin: 10px 0px;
        }
  
        .mten {
          margin-top: 10px;
          margin-bottom: 10px;
        }
  
        .stick {
          display: flex;
          flex-direction: row;
          /* align-items: center; */
        }
  
        @media only screen and (max-width: 750px) {
          .position {
            flex-direction: column;
            padding-left: 30px;
            padding-right: 30px;
          }
  
          .closer {
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 8px;
            padding-left: 20px;
            padding-right: 20px;
          }
  
          h1 {
            font-size: 40px;
          }
  
          h5 {
            font-size: 20px;
          }
  
          .dnone {
            text-align: center;
          }
          .dend {
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="position" style="border-bottom: 2px solid #f8b133">
          <div class="dnone">
          <svg
          xmlns="http://www.w3.org/2000/svg"
          width="163"
          height="51"
          fill="none"
          viewBox="0 0 163 51"
        >
          <path
            fill="#3D3D3B"
            d="M34.553 23.543a7.698 7.698 0 0 1 2.418 2.559 6.567 6.567 0 0 1 .905 3.382 6.694 6.694 0 0 1-.6 2.812 7.2 7.2 0 0 1-1.644 2.27 7.803 7.803 0 0 1-2.418 1.523c-.92.37-1.882.556-2.888.556h-6.61v-5.371h6.61c.528 0 .977-.178 1.339-.535.362-.357.55-.775.55-1.255 0-.48-.188-.892-.565-1.256a1.864 1.864 0 0 0-1.324-.535 7.751 7.751 0 0 1-2.969-.57 7.623 7.623 0 0 1-2.396-1.556 7.41 7.41 0 0 1-1.607-2.27 6.57 6.57 0 0 1-.586-2.758c0-.981.202-1.9.6-2.772a7.367 7.367 0 0 1 1.622-2.27 7.69 7.69 0 0 1 2.396-1.537 7.522 7.522 0 0 1 2.932-.57h6.61v5.372h-6.61c-.579 0-1.042.185-1.383.556-.34.37-.506.782-.506 1.234 0 .55.188.988.564 1.304.377.322.819.48 1.325.48.782 0 1.528.11 2.252.322.716.206 1.375.501 1.983.885ZM53.477 13.377h5.668v25.058c0 1.647-.326 3.183-.985 4.603a11.687 11.687 0 0 1-2.663 3.69 12.677 12.677 0 0 1-3.91 2.45 12.547 12.547 0 0 1-4.72.892v-5.372c.905 0 1.767-.157 2.57-.48a6.54 6.54 0 0 0 2.114-1.344 6.343 6.343 0 0 0 1.419-2.003c.34-.762.507-1.578.507-2.436v-2.544c-.03.027-.051.034-.073.034a9.575 9.575 0 0 1-3.699.713 9.621 9.621 0 0 1-3.649-.7 9.59 9.59 0 0 1-3.004-1.913 9.334 9.334 0 0 1-2.041-2.847c-.507-1.084-.753-2.25-.753-3.492V13.377h5.668V27.7c0 .528.109 1.009.319 1.448.217.439.492.816.832 1.125a3.896 3.896 0 0 0 2.62 1.001c.53 0 1.021-.09 1.47-.268a3.624 3.624 0 0 0 1.998-1.9c.203-.439.304-.912.304-1.413V13.377h.008Z"
          ></path>
          <path
            fill="#F8B133"
            d="M89.861 14.914a9.15 9.15 0 0 1 3.063 3.169 8.337 8.337 0 0 1 1.136 4.24v14.322h-5.668V22.322a3.757 3.757 0 0 0-1.115-2.524c-.695-.707-1.578-1.057-2.664-1.057-.529 0-1.02.09-1.47.268a3.625 3.625 0 0 0-1.998 1.9c-.202.44-.304.912-.304 1.413v14.323h-5.668V22.322a3.756 3.756 0 0 0-1.115-2.524c-.695-.707-1.578-1.057-2.664-1.057-.529 0-1.02.09-1.477.268a3.625 3.625 0 0 0-1.998 1.9c-.203.44-.304.912-.304 1.413v14.323h-5.668V22.322a8.35 8.35 0 0 1 .738-3.491 9.104 9.104 0 0 1 2.005-2.847 9.407 9.407 0 0 1 2.983-1.914c1.144-.466 2.389-.7 3.72-.7 1.282 0 2.491.234 3.606.7a10.912 10.912 0 0 1 3.004 1.845 10.462 10.462 0 0 1 2.969-1.845c1.122-.466 2.338-.7 3.648-.7.956 0 1.89.137 2.794.412a9.718 9.718 0 0 1 2.447 1.132ZM111.623 14.914a9.146 9.146 0 0 1 3.019 3.183 8.369 8.369 0 0 1 1.136 4.225v14.323h-5.668v-8.952h-7.558v8.952h-5.669V22.322a8.25 8.25 0 0 1 .753-3.491 9.332 9.332 0 0 1 2.042-2.847 9.585 9.585 0 0 1 3.004-1.914 9.57 9.57 0 0 1 3.649-.7 9.56 9.56 0 0 1 2.816.412c.898.281 1.723.652 2.476 1.132Zm-1.513 7.408c0-.5-.102-.974-.304-1.413a3.528 3.528 0 0 0-.833-1.145 4.017 4.017 0 0 0-1.209-.755 3.765 3.765 0 0 0-1.433-.268 3.859 3.859 0 0 0-2.7 1.077 3.768 3.768 0 0 0-.797 1.146 3.37 3.37 0 0 0-.282 1.358h7.558ZM117.899 13.377h17.005v5.371h-5.668v17.897h-5.668V18.741h-5.669v-5.364ZM145.705 19.208c-.753.26-1.44.672-2.056 1.235a6.65 6.65 0 0 0-1.455 1.88h8.803v5.37h-8.803c.601 1.173 1.455 2.058 2.549 2.669 1.093.61 2.236.912 3.416.912.855 0 1.687-.15 2.491-.446a6.35 6.35 0 0 0 2.193-1.379l4.004 3.794a12.125 12.125 0 0 1-4.025 2.545c-1.499.57-3.055.857-4.67.857-1.911 0-3.627-.343-5.14-1.036-1.513-.693-2.794-1.591-3.851-2.702a12.13 12.13 0 0 1-2.44-3.739c-.564-1.386-.847-2.771-.847-4.15 0-1.742.362-3.327 1.079-4.76a12.08 12.08 0 0 1 2.794-3.67 12.509 12.509 0 0 1 3.931-2.36 12.482 12.482 0 0 1 4.474-.844c1.615 0 3.171.288 4.67.857a12.126 12.126 0 0 1 4.025 2.545l-4.004 3.794a6.48 6.48 0 0 0-2.193-1.379 7.187 7.187 0 0 0-2.491-.446 6.157 6.157 0 0 0-2.454.453Z"
          ></path>
          <path
            fill="#3D3D3B"
            d="M9.483 13.898H7.79c-.231 0-.31-.075-.31-.301v-.282c0-.192.093-.28.296-.28h3.424c.246 0 .326.075.326.315v.28c-.007.18-.094.262-.282.262-.594.006-1.173.006-1.76.006Z"
          ></path>
          <path
            fill="#F8B133"
            d="M4.93 10.146c-.007-.185.043-.405.116-.624a.247.247 0 0 0-.022-.213 1.558 1.558 0 0 1-.174-.439c-.137-.569.094-.994.652-1.234.145-.062.29-.11.442-.138.1-.02.13-.061.115-.157-.05-.33-.014-.652.167-.94.217-.35.572-.508.977-.576.254-.042.507-.035.76-.021.087.007.145-.02.21-.082.348-.35.753-.61 1.267-.659.326-.034.623.055.898.213.203.116.376.26.528.432.065.069.116.075.21.041a3.805 3.805 0 0 1 1.361-.267c.869 0 1.448.418 1.622 1.228.058.246.145.397.412.473.232.062.428.206.616.357.55.445.688 1.015.42 1.673-.03.076-.058.158-.102.22-.137.178-.13.37-.116.576.022.37-.036.74-.21 1.077-.29.542-.781.782-1.39.85-.072.007-.144.028-.217.014-.26-.034-.477.062-.702.179-.427.22-.883.37-1.368.404-.528.035-1-.096-1.361-.473-.072-.075-.123-.082-.21-.034-.449.233-.927.384-1.448.384-.63 0-1.122-.254-1.477-.74a.314.314 0 0 0-.26-.145 2.535 2.535 0 0 1-.956-.206c-.514-.233-.767-.603-.76-1.173Z"
          ></path>
          <path
            fill="#FCFCFC"
            d="M12.995 8.294c-.37 0-.601-.192-.76-.494a1.904 1.904 0 0 1-.189-.713c-.007-.09-.036-.09-.108-.055-.21.117-.435.199-.674.233-.39.055-.71-.062-.977-.33a1.357 1.357 0 0 1-.318-.52c-.022-.07-.044-.13.05-.158.087-.028.109.04.13.096.087.233.225.439.435.59.26.178.543.185.84.103.217-.062.412-.165.6-.282.044-.027.095-.068.153-.034.057.034.05.09.05.144a2 2 0 0 0 .152.796c.16.37.435.507.847.411.058-.013.116-.034.174-.048.058-.013.108-.02.13.042.03.068-.007.11-.072.137a1.845 1.845 0 0 1-.463.082ZM10.425 10.455c.514 0 .818.144 1.064.412.065.068.094.061.152-.007.478-.57 1.107-.762 1.853-.631.072.013.145.027.13.116-.014.096-.101.076-.173.062-.652-.117-1.202.041-1.63.528-.05.055-.093.123-.137.185-.08.11-.13.11-.217.007-.065-.082-.123-.158-.203-.226-.304-.26-.651-.33-1.042-.22a2.112 2.112 0 0 0-.63.302c-.036.027-.065.055-.116.048a.103.103 0 0 1-.08-.062c-.021-.048.015-.082.051-.102.319-.24.68-.405.978-.412ZM9.52 6.421c-.008.021-.015.042-.022.069-.152.322-.34.617-.68.782-.044.02-.058.041-.058.09.043.397.13.781.376 1.117a.87.87 0 0 0 .355.282c.072.027.123.075.08.15-.044.076-.11.042-.167.021a1.136 1.136 0 0 1-.521-.473 2.455 2.455 0 0 1-.312-.974c-.014-.083-.036-.117-.13-.117-.398 0-.724-.165-1.02-.398-.044-.034-.08-.082-.037-.137.044-.055.109-.041.16-.007.115.09.231.165.361.226.529.247.97.13 1.274-.35.058-.095.102-.198.16-.294.021-.041.058-.076.116-.062.036-.007.065.02.065.075ZM6.993 9.748c-.007.144-.007.144.13.11.384-.082.768-.103 1.115.103.37.213.514.556.587.94.007.062-.022.11-.087.116-.073.014-.094-.04-.109-.096a1.655 1.655 0 0 0-.13-.404c-.188-.384-.536-.57-.985-.535-.195.013-.39.048-.571.116-.058.02-.116.041-.174 0-.058-.041-.022-.096-.015-.15.073-.31.008-.59-.159-.858a1.78 1.78 0 0 0-.384-.446c-.043-.041-.08-.082-.029-.137.044-.048.102-.041.152 0 .355.274.674.754.66 1.241ZM10.627 8.96c.03-.412.232-.762.529-1.07.043-.042.094-.062.145-.014.05.048.036.096-.008.137-.13.13-.246.281-.325.446-.254.5-.145.974.31 1.324.059.048.124.082.182.13.043.034.05.075.022.123-.037.049-.08.055-.13.021-.406-.254-.703-.583-.725-1.098Z"
          ></path>
          <path
            fill="#3D3D3B"
            d="M5.893 36.947V16.334h-2.52v-3.115a2.713 2.713 0 0 1-.644-1.522c-.014-.042-.043-.076-.058-.117-.55-1.351.037-2.93.47-4.24.015-.034.03-.061.044-.095a1.387 1.387 0 0 0-1.194-.659C.89 6.586 0 7.43 0 8.466v28.481"
          ></path>
          <path
            fill="#3D3D3B"
            d="M21.971 13.377c-.282-.267-.572-.528-.854-.796a1.88 1.88 0 0 1-.58-1.145 3.863 3.863 0 0 1 .023-1.118c.087-.494.195-.988.144-1.503-.021-.233-.029-.473-.05-.706-.13-1.544-.63-2.936-1.65-4.17-1.557-1.88-3.548-3.06-5.995-3.588-.478-.103-.97-.13-1.455-.2-1.035-.15-2.085-.219-3.12-.061-2.52.384-4.54 1.536-6.132 3.306C1.31 4.494.572 5.73.24 7.15c-.311 1.296-.304 2.606-.065 3.91.318 1.728.992 3.313 2.157 4.705.89 1.064 2.128 1.633 3.403 1.743l-3.005 2.078L3.75 23.62h1.97a4.967 4.967 0 0 0-.63 1.296l6.45.014c.97 0 1.846-.542 2.244-1.379 0-.007.007-.014.007-.02.16-.344.398-.645.688-.906.195-.178.362-.336.608-.274.767.178 1.534.322 2.316.384.29.02.58.02.869-.007.63-.048 1.318-.185 1.556-.762.116-.288.152-.576-.072-.843-.232-.282-.239-.583-.08-.892.044-.082.095-.165.152-.24.109-.144.254-.254.377-.384.188-.206.217-.453.13-.707-.072-.22-.26-.322-.47-.377a.733.733 0 0 0 .354-.151c.189-.13.261-.391.145-.583a.872.872 0 0 1-.116-.5c.008-.145 0-.296 0-.44.008-.5.232-.871.717-1.09.319-.145.652-.24.992-.31.427-.082.716-.35.796-.747l-.05-.391c-.16-.37-.435-.659-.732-.933ZM3.062 12.314c-.39-1.18-.42-2.387-.195-3.595.355-1.893 1.31-3.47 2.932-4.65a7.182 7.182 0 0 1 7.934-.302c1.296.802 2.244 1.893 2.91 3.196 1.093 2.127 1.39 4.343.695 6.64-.427 1.414-1.165 2.683-2.15 3.815-.29.329-.586.644-.898.946a5.503 5.503 0 0 1-.962.59c-4.22 1.907-6.798-.782-7.334-1.427 1.73.062 3.475-.727 4.445-2.325.072-.117.109-.281.217-.357.116-.075.29-.014.442-.027h.029c.145-.014.231-.096.239-.234.007-.082 0-.171 0-.253 0-.24-.073-.31-.326-.31H8.086c-.449 0-.463.021-.463.433 0 .295.029.322.319.377 0 .007 0 .007.007.014-.869.61-1.97.672-2.853.117-1.02-.631-1.672-1.55-2.034-2.648Z"
          ></path>
          <path
            fill="#020203"
            d="M156.948 10.791a3.072 3.072 0 0 1 .413-1.543c.13-.227.289-.426.47-.61.181-.186.391-.337.616-.467.224-.13.463-.227.723-.295a3.15 3.15 0 0 1 .804-.103c.275 0 .543.034.804.103.253.068.499.171.724.295.224.13.427.28.615.466.181.178.34.384.47.61a3.072 3.072 0 0 1 .413 1.544 3.07 3.07 0 0 1-.413 1.543c-.13.227-.289.426-.47.61a3.041 3.041 0 0 1-.615.467c-.225.13-.464.234-.724.302a3.15 3.15 0 0 1-.804.103 3.15 3.15 0 0 1-.804-.103 3.017 3.017 0 0 1-.723-.302 3.291 3.291 0 0 1-.616-.466 2.642 2.642 0 0 1-.47-.61 3.07 3.07 0 0 1-.413-1.544Zm.362 0a2.71 2.71 0 0 0 .362 1.365c.116.199.253.377.42.542.159.165.34.302.543.412.195.116.405.205.637.267a2.622 2.622 0 0 0 1.404 0c.225-.062.435-.15.637-.267.196-.117.377-.254.543-.412a2.71 2.71 0 0 0 .775-1.907 2.668 2.668 0 0 0-.362-1.358 2.55 2.55 0 0 0-.956-.947 2.462 2.462 0 0 0-.637-.267 2.66 2.66 0 0 0-1.737.11 2.676 2.676 0 0 0-.847.562c-.239.24-.435.521-.572.844-.138.336-.21.686-.21 1.056Zm1.976.254v1.392h-.42V9.05h1.101c.42 0 .738.082.963.247.224.164.333.418.333.754a.75.75 0 0 1-.152.473c-.102.13-.254.24-.449.323.202.069.347.178.427.322.08.144.123.316.123.508v.178c0 .103.007.2.014.288.008.09.029.165.058.227v.062h-.434a.537.537 0 0 1-.036-.13l-.022-.165c-.007-.055-.007-.11-.007-.165V11.676c0-.226-.051-.384-.159-.487-.109-.103-.29-.151-.543-.151h-.797v.007Zm0-.364h.775c.108 0 .203-.013.304-.04a.934.934 0 0 0 .253-.117.628.628 0 0 0 .174-.193.532.532 0 0 0 .065-.267.91.91 0 0 0-.043-.295.419.419 0 0 0-.145-.199.662.662 0 0 0-.275-.117 1.871 1.871 0 0 0-.42-.034h-.68v1.262h-.008Z"
          ></path>
        </svg>
          </div>

          <div class="dnone closer">
            <div class="itemend">
              <div>
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                    align-items: center;
                  "
                >
                  <div
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: end;
                      padding-bottom: 10px;
                    "
                  >
                    <div>
                      <div
                        style="display: flex; gap: 5px; justify-content: end"
                      >
                        <p style="margin: 3px 0px; font-size: 13px">
                          <b id="dr-name">Dr. Samant Darshi</b>
                        </p>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          style="width: 20px"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div
                      style="
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        justify-content: end;
                      "
                    >
                      <p
                        style="margin: 3px 0px; font-size: 13px"
                        id="dr-qual"
                      ></p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        style="width: 20px"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                        />
                      </svg>
                    </div>

                    <div
                      style="
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        justify-content: end;
                      "
                    >
                      <p style="margin: 3px 0px; font-size: 13px" id="number">
                        DMC/R/10298
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        style="width: 20px"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          style="
            display: flex;
            flex-direction: row;
            align-items: center;
            overflow-x: auto;
          "
        >
          <div class="fourd" style="border-left: 2px solid black">
            <p class="pstyle">Name</p>
            <p class="pstyle"><b id="patient-name">Dashrath Singh</b></p>
          </div>
          <div class="fourd">
            <p class="pstyle">Age/Gender</p>
            <p class="pstyle"><b id="patient-age-gender">42y/ Male</b></p>
          </div>
          <div class="fourd">
            <p class="pstyle">Date</p>
            <p class="pstyle"><b id="date">11/12/2023</b></p>
          </div>
          <div class="fourd" style="border-right: 2px solid black">
            <p class="pstyle">Reg. Number</p>
            <p class="pstyle"><b id="patient-psyID"></b></p>
          </div>
        </div>

        <div style="margin-top: 15px">
          <p style="border-left: 4px solid #f8b133; padding: 5px"><b>Rx</b></p>
        </div>

        <div>
          <table>
            <thead></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div style="margin-top: auto">
        <div class="secfooter">
          <p style="font-size: 10px">
            <b>Note to Pharmaciest: </b>In view of patent's safty, kindly
            dispense the medacation on only for the period specified in the
            prescription.
          </p>
        </div>
        <div class="secfooter" style="text-align: center">
          <p style="font-size: 10px">
            <b>
              <span id="est-website"> </span> | <span id="est-email"> </span> |
              <span id="est-phone"> </span
            ></b>
            <br />
            <b>NOIDA | DELHI | GURUGRAM</b>
          </p>
        </div>
      </div>

  </body>
    <script>
    const data = {{data}};
    const createdBy = {{createdBy}};
    const patient = {{patient}};
    const company = {{company}};
    const date = '{{date}}';
    const number = '{{number}}';
      document.getElementById("dr-name").innerText =
        (createdBy.prefix || "") + " " + createdBy.displayName;
      document.getElementById("dr-qual").innerText = createdBy.qualifications;
      document.getElementById("est-phone").innerText = company.phone || "--";
      document.getElementById("est-email").innerText = company.email || "--";
      document.getElementById("est-website").innerText = company.website || "--";
      document.getElementById("patient-name").innerText =
        patient.displayName || "--";
      document.getElementById("patient-age-gender").innerText =
        patient.age || "-- " + "/" + patient.gender || " -- ";
      document.getElementById("date").innerText = date;
      document.getElementById("patient-psyID").innerText = patient.psyID;
      const tableBody = document.querySelector("tbody");
      const theadElement = document.querySelector("thead");
      const trElement = document.createElement("tr");
      var tableHeaders = [];
  
      if (data.type == "prescriptions") {
        tableHeaders = [
          "Drug Name",
          "Dose",
          "Morning",
          "Afternoon",
          "Evening",
          "Night",
          "Instruction",
          "Duration",
        ];
        data.items.forEach((data) => {
          const row = document.createElement("tr");
          const cell1 = document.createElement("td");
          const cell2 = document.createElement("td");
          const cell3 = document.createElement("td");
          const cell4 = document.createElement("td");
          const cell5 = document.createElement("td");
          const cell6 = document.createElement("td");
          const cell7 = document.createElement("td");
          const cell8 = document.createElement("td");
          cell1.innerText = data?.displayName || "--";
          cell2.innerText = data?.dosage || "--";
          cell3.innerText = data?.morning || "--";
          cell4.innerText = data?.afternoon || "--";
          cell5.innerText = data?.evening || "--";
          cell6.innerText = data?.night || "--";
          cell7.innerText = data?.instructions || "--";
          cell8.innerText = data?.duration || "--";
          row.appendChild(cell1);
          row.appendChild(cell2);
          row.appendChild(cell3);
          row.appendChild(cell4);
          row.appendChild(cell5);
          row.appendChild(cell6);
          row.appendChild(cell7);
          row.appendChild(cell8);
          tableBody.appendChild(row);
        });
      } else if (data.type == "vitalSigns") {
        tableHeaders = [
          "Weight",
          "Blood Pressure",
          "Pulse",
          "Resp Rate",
          "Temperature",
        ];
        const row = document.createElement("tr");
        const cell1 = document.createElement("td");
        const cell2 = document.createElement("td");
        const cell3 = document.createElement("td");
        const cell4 = document.createElement("td");
        const cell5 = document.createElement("td");
        cell1.innerText = data.weight || "--";
        cell2.innerText = data.bloodPressure || "--";
        cell3.innerText = data.pulse || "--";
        cell4.innerText = data.respRate || "--";
        cell5.innerText = data.temperature || "--";
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        row.appendChild(cell5);
        tableBody.appendChild(row);
      } else if (data.type == "clinicalNotes") {
        tableHeaders = ["Complaints", "Observations", "Diagnoses", "Notes"];
        const row = document.createElement("tr");
        const cell1 = document.createElement("td");
        const cell2 = document.createElement("td");
        const cell3 = document.createElement("td");
        const cell4 = document.createElement("td");
        cell1.innerText = data.complaints || "--";
        cell2.innerText = data.observations || "--";
        cell3.innerText = data.diagnoses || "--";
        cell4.innerText = data.notes || "--";
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        tableBody.appendChild(row);
      } else if (data.type == "labOrder") {
        tableHeaders = ["Name", "Instructions"];
        data.items.forEach((data) => {
          const row = document.createElement("tr");
          const cell1 = document.createElement("td");
          const cell2 = document.createElement("td");
  
          cell1.innerText = data.displayName || "--";
          cell2.innerText = data.instructions || "--";
          row.appendChild(cell1);
          row.appendChild(cell2);
          tableBody.appendChild(row);
        });
      }
  
      tableHeaders.forEach((headerText) => {
        const thElement = document.createElement("th");
        thElement.textContent = headerText;
        trElement.appendChild(thElement);
      });
  
      theadElement.appendChild(trElement);
    </script>
  </html>
  `;
};

module.exports = { prescriptionTemplate };
