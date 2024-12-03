# EduPageTestHack
Hack for correct answers on Edupage tests

Warning:  
- If your test is paged, you will have to click the extension's icon every page

## Bugs
If this extenstion is not working for you, or you've found any bug [open a new issue](https://github.com/markotomcik/EduPageTestHack/issues/new/choose), or pop a pull request

# Known issues
https://github.com/numero69/edupage_hack/issues/

# TUTORIAL
0. Get the extension as a ZIP from the repo [here](https://github.com/RichardKanshen/edupagehackextended/releases).  
You can stop here, but if you want more tests covered, follow the steps below
## Optional Tutorial
### Temporary Way (lasts 7 days)
> [!WARNING]
> This method requires a Premium Requestly feature. New accounts get 7 days of Requestly Premium for free, but afterwards, this way will stop working.
> ### **I heavily recommend you migrate to the second way, or set it up instead of this method in the first place.**
1. Download and install [Requestly **For Desktop**](https://requestly.com/downloads/). Create an account and sign in in your Requestly Desktop app.
2. Under **HTTP Rules**, click on **New Rules**, and **Modify Response**.
3. In the _Rule Settings_
   1. under _Resource Type_
      - choose **REST API**
   2. under _If Request_
      - Select **URL** and **RegEx**, and into the field, paste
      `/https:\/\/SLUG.edupage.org\/elearning\/pics\/js\/etest\/etestPlayer.js(.*)/`
      MAKE SURE TO REPLACE `SLUG` with your EduPage subdomain, for ex. ssnd for ssnd.edupage.org
      - keep the **Response Status Code** empty
      - In the Response Body, choose **Dynamic (JavaScript)**, and paste in the following code:
         ```JS
         function modifyResponse(args) {
		     const {method, url, response, responseType, requestHeaders, requestData, responseJSON} = args;
		     console.log(response)
		     return response.replace("var materialObj = null;", "window.materialObj = null;");
		}
         ```
   3. Click **\*Save Rule**

Make sure to click on **Connect apps**, follow the instructions on setting up the local proxy server, and whenever Requestly starts, **Enable Requestly system-wide** to catch EduPage Requests.

### More Permanent Way (lasts basically forever)
> [!IMPORTANT]
> For the upcoming steps, you will need the node runtime and the node package manager (npm).
> You can download it from [here](https://nodejs.org/en/download/prebuilt-installer) (npm comes automatically with node).
1. Next, you want to create a [Netlify](https://app.netlify.com) account.
   1. After that, in the pages dashboard, you want to click on Browse To Upload, and select the folder named `empty` in the unzipped folder. This is just a folder with a blank HTML document - we just want to get a clean site ASAP. After you click upload, Netlify will upload this almost empty folder, and deploy it. ![image](https://github.com/user-attachments/assets/2c46a601-5932-4d77-8c0c-4cfe4bc9d9cd)
   2. Afterwards, you will need your command prompt. Open it, and navigate to your .netlify folder in the unzipped extension folder.
      1. `npm i` - install all the dependencies needed. I was not kidding with that node warning!
      2. `netlify login` - log in into your Netlify account. This will open your browser!
      3. `netlify link` - select **_Choose from a list of your recently updated sites_**, and then your newly-created site.
      4. Lastly, `netlify deploy --prod` - this will deploy your function to the web. Take note of your **_Website URL_**
   
![image](https://github.com/user-attachments/assets/eb470bc6-1f4b-44d5-9e8f-e656bf2472e2)

2. Almost done! We have the server, and now we just need to redirect to it! We will use a browser extension [Requestly](https://requestly.com/downloads/). Download it for your browser, and open its dashboard at https://app.requestly.io. You might need to create an account.
   1. In the **HTTP Rules** tab, click **New Rule**, and **Redirect Request**.
   2. Next, you will want to grab your EduPage URL, for example ssnd.edupage.org.   
   ![image](https://github.com/user-attachments/assets/5d5804bf-bf87-4215-944c-863abf65c6f2)
      In the **If Request** field, choose **_URL_** and **_RegEx_**, and paste
      ```
      /https:\/\/slug.edupage.org\/elearning\/pics\/js\/etest\/etestPlayer.js(.*)/
      ```
      into the text field. MAKE SURE TO REPLACE `slug` WITH YOUR EDUPAGE URL (for ex. ssnd)
      In the **Redirects To** field, choose **Another URL**, and paste
      ```
      https://YOURNETLIFYURL.netlify.app/.netlify/functions/edupageTestPlayer?url=https%3A%2F%2FSLUG.edupage.org%2Felearning%2Fpics%2Fjs%2Fetest%2FetestPlayer.js
      ```
      into the text field. MAKE SURE TO REPLACE `SLUG` WITH YOUR EDUPAGE URL (for ex. ssnd) AND `YOURNETLIFYURL` WITH YOUR NETLIFY URL (for ex. lovely-arithmetic-a8dc92)