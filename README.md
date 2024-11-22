# EduPageTestHack
Hack for correct answers on Edupage tests

Warning:  
- If your test is paged, you will have to click the extension's icon every page

## Bugs
If this extenstion is not working for you, or you've found any bug [open a new issue](https://github.com/markotomcik/EduPageTestHack/issues/new/choose), or pop a pull request

# Known issues
https://github.com/numero69/edupage_hack/issues/

# TUTORIAL
0. Get the extension as a ZIP from the repo [here](https://github.com/RichardKanshen/edupagehackextended/releases) (I will update the code and put out the repo soon.)
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