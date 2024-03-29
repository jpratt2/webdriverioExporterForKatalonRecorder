function convertKatalonSyntax(command, target, value){
    //2 types of tests need special handing:
    if(/Attribute/.test(command)){
       //the assertAttribute and other *Attribute commands use this format for the target: foo@attribute, for example: link=clickhere@href
       //this will separate the attribute value from the target syntax
       var attributeArr = separateAttributeFromTarget(target);
        target = attributeArr[0];
        var attribute = attributeArr[1];
    }
    if(/Table/.test(command)){
        //the assertTable and other *Table commands attach the X and Y coordinate values to the target (example: foo.1.4)
        //this will separate the X and Y values from the target syntax
        var targetwithTableXYArr = separateTableXYFromTarget(target);
        target = targetwithTableXYArr[0];
        var rowIndex = targetwithTableXYArr[1];
        var columnIndex = targetwithTableXYArr[2];
    }
    
    target = formatTarget(target);
    value = formatValue(value);
    command = command.replace("AndWait","");//there should never be a need to request a wait
    if(/waitFor/.test(command)){
        return '//there should be no need for a "waitFor" command. It should automatically be provided'
    }
    //learn more about the "Selenese" commands used in the Katalon Recorder here:
    //https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
    
    switch(command){
        case "addScript":
            //adds some javascript into a script tag with a specific tag id. Format: addScript(scriptContent, scriptTagId).
            return 'executeJavaScript("var newScript=document.createElement(\'SCRIPT\');newScript.setAttribute(\'id\',\''+value+'\');newScript.innerText=\''+target+'\';document.head.appendChild(newScript);");';
            
        case "altKeyDown":
            return '//For altKetDown in webdriver, you may want to consider the java Robots class (or KEYS.chord, which doesnt seem to work.) https://stackoverflow.com/a/30756738';
            
        case "answerOnNextPrompt":
            //adds input text for prompt
            return 'prompt("' + value + '"); //Manually move this command to be after the command that opens the prompt.';
            
        case "assertAlert":
        case "assertConfirmation":
        case "assertPrompt":
        case "verifyAlert":
        case "verifyConfirmation":
        case "verifyPrompt":    
            //asserts text in an alert/confirmation/prompt box
            return 'confirm("' + value + '");';
            
        case "assertNotAlert":
        case "assertNotConfirmation":
        case "assertNotPrompt":
        case "verifyNotAlert":
        case "verifyNotConfirmation":
        case "verifyNotPrompt":
            //asserts that the text in an alert/confirmation/prompt box is NOT the specified value.
            //(This is regular Selenium code)
            return 'assertNotEquals("' + value + '", getWebDriver().switchTo().alert().getText()); getWebDriver().switchTo().alert().accept();//assertNotPrompt';

        case "assertAlertPresent":
        case "assertConfirmationPresent":
        case "assertPromptPresent":
        case "verifyAlertPresent":
        case "verifyConfirmationPresent":
        case "verifyPromptPresent":
            //asserts that a prompt/alert is present
            isAlertPresentFunctionNeededGlb = true;
            return "assertTrue(isAlertPresent());";

        case "assertAlertNotPresent":
        case "assertConfirmationNotPresent": 
        case "assertPromptNotPresent":
        case "verifyAlertNotPresent":
        case "verifyConfirmationNotPresent": 
        case "verifyPromptNotPresent":
            //asserts that a prompt/alert is absent
            isAlertPresentFunctionNeededGlb = true;
            return "assertFalse(isAlertPresent());";

        case "assertAttribute":
        case "verifyAttribute":
            //the attribute variable was declared with special handling near the top
            //asserts the value of an attribute
            return target + '.shouldHave(attribute("' + attribute + '","' + value + '"));';      
        case "assertNotAttribute":
        case "verifyNotAttribute":
            //asserts that the value of an attribute is NOT the specified value
            return target + '.shouldNotHave(attribute("' + attribute + '","' + value + '"));';

        case "assertBodyText":
        case "verifyBodyText":
            //asserts that the text of the page matches the value
            return 'AssertEquals("' + value + '", $(By.tagName("body")).getText();';
        case "assertNotBodyText":
        case "verifyNotBodyText":
            //asserts that the text of the page does NOT match the value
            return 'AssertNotEquals("' + value + '", $(By.tagName("body")).getText();';
             
        case "assertChecked":
        case "verifyChecked":
            //asserts that an element is checked.
            return target + '.shouldBe(checked);';
        case "assertNotChecked":
        case "verifyNotChecked":
            //asserts that an element is checked.
            return target + '.shouldNotBe(checked);';

        case "assertCookie":
        case "verifyCookie":
        case "assertNotCookie":
        case "verifyNotCookie":
            //returns the name and value pairs of all cookies on the page in a string. This will need some manual work as the cookies are listed in a different order.
            return 'String result = ""; for(Cookie ck : getWebDriver().manage().getCookies()) { result += ck.getName() + "=" + ck.getValue() + "; "; } result.trim(); assertEquals("'+target+'",result);//assertCookie';

        case "assertCookieByName":
        case "verifyCookieByName":
            //assert the value of a cookie
            return 'assertEquals("' + value + '", getWebDriver().manage().getCookieNamed("' + target + '").getValue());';
        case "assertNotCookieByName":
        case "verifyNotCookieByName":
            //assert that the cookie does NOT have the value
            return 'assertNotEquals("' + value + '", getWebDriver().manage().getCookieNamed("' + target + '").getValue());';
            
        case "assertCookiePresent":
        case "verifyCookiePresent":
            isCookiePresentFunctionNeededGlb = true;
            return 'assertTrue(isCookiePresent("' + target + '"));';
        case "assertCookieNotPresent":
        case "verifyCookieNotPresent":
            isCookiePresentFunctionNeededGlb = true;
            return 'assertFalse(isCookiePresent("' + target + '"));';

        case "assertCssCount":
        case "verifyCssCount":
            //asserts the number of nodes that match a specified css selector
            return 'assertEquals(' + value + ', $' + target + '.size());';
        case "assertNotCssCount":
        case "verifyNotCssCount":
            //asserts that the number of nodes of a specified css selector does not match the given value
            return 'assertNotEquals(' + value + ', $' + target + '.size());';
                  
        case "assertCursorPosition":
        case "assertNotCursorPosition":
        case "verifyCursorPosition":
        case "verifyNotCursorPosition":
            return '//for cursor position in java, consider https://stackoverflow.com/a/51484308';
                
        case "assertEditable":
        case "verifyEditable":
            return 'assertTrue((Boolean) executeJavaScript("if(arguments[0].nodeName===\'INPUT\' || arguments[0].nodeName===\'TEXTAREA\'){ return !arguments[0].disabled && !arguments[0].readOnly; }else{ return arguments[0].isContentEditable};", '+target+'));';
        case "assertNotEditable":
        case "verifyNotEditable":
            return 'assertNotTrue((Boolean) executeJavaScript("if(arguments[0].nodeName===\'INPUT\' || arguments[0].nodeName===\'TEXTAREA\'){ return !arguments[0].disabled && !arguments[0].readOnly; }else{ return arguments[0].isContentEditable};", '+target+'));';
            /* based on the following JS function:
            function isEditable(element){
                if(element.nodeName==="INPUT" || element.nodeName==="TEXTAREA"){
                    return !element.disabled && !element.readOnly;
                }else{
                    return element.isContentEditable;
                }
            }
            resource: https://stackoverflow.com/a/60160327
            */
            
        case "assertElementHeight":
        case "verifyElementHeight":
            //asserts the height of an element in pixels 
           return 'assertEquals(' + value + ', ' + target + '.getSize().getHeight());';
        case "assertNotElementHeight":
        case "verifyNotElementHeight":
            //asserts that the height of an element in pixels is NOT a value
           return 'assertNotEquals(' + value + ', ' + target + '.getSize().getHeight());';
            
        case "assertElementPresent":
        case "verifyElementPresent":
            //asserts that the element is present 
            return target + '.should(exist);';       
        case "assertElementNotPresent":
        case "verifyElementNotPresent":
            //asserts that the element is absent
            return target + '.shouldNot(exist);';

        case "assertElementPositionLeft":
        case "verifyElementPositionLeft":
            //asserts the # pixels from the left edge of the frame. 
            return 'assertEquals(' + value + ', ' + target + '.getLocation().getX();';         
        case "assertNotElementPositionLeft":
        case "verifyNotElementPositionLeft":
            //asserts that the # of pixels for the left edge of the frame does NOT equal the specified value. 
            return 'assertNotEquals(' + value + ', ' + target + '.getLocation().getX();';        
        
        case "assertElementPositionTop":
        case "verifyElementPositionTop":
            //asserts the # pixels from the top edge of the frame. 
            return 'assertEquals(' + value + ', ' + target + '.getLocation().getY();';          
        case "assertNotElementPositionTop":
        case "verifyNotElementPositionTop":
            //asserts that the # of pixels for the top edge of the frame does NOT equal the specified value. 
            return 'assertNotEquals(' + value + ', ' + target + '.getLocation().getY();';  

        case "assertElementWidth":
        case "verifyElementWidth":
            //asserts the width of an element in pixels 
            return 'assertEquals(' + value + ', ' + target + '.getSize().getWidth());';        
        case "assertNotElementWidth":
        case "verifyNotElementWidth":
            //asserts that the width of an element in pixels is not the specified value. 
            return 'assertNotEquals(' + value + ', ' + target + '.getSize().getWidth());';

        case "assertHtmlSource":
        case "verifyHtmlSource":
            //asserts the entire HTML source 
            return 'assertEquals("' + value + '", getWebDriver().getPageSource();';
        case "assertNotHtmlSource":
        case "verifyNotHtmlSource":
            //asserts that the entire HTML source is not the specified value
            return 'assertNotEquals("' + value + '", getWebDriver().getPageSource();';            
            
        case "assertLocation":
        case "verifyLocation":
            //asserts the page's URL 
            return 'assertEquals("' + value + '", currentFrameUrl();';
        case "assertNotLocation":
        case "verifyNotLocation":
            //asserts that the page's URL is not the specified value.
            return 'assertNotEquals("' + value + '", currentFrameUrl();';

        case "assertSelectOptions":
        case "verifySelectOptions":
            //asserts the value of an array converted to a string of all options (the visible text) in a select tool
            return 'assertEquals("'+value+'",executeJavaScript("return Array.from(arguments[0]).map(option => option.text).join();",'+target+'));';
        case "assertNotSelectOptions":
        case "verifyNotSelectOptions":
            return 'assertNotEquals("'+value+'",executeJavaScript("return Array.from(arguments[0]).map(option => option.text).join();",'+target+'));';
            
        case "assertSelectedId":
        case "assertSelectedIds":
        case "verifySelectedId":
        case "verifySelectedIds":
            //asserts the value of an array converted to a string of all optionids selected in a select tool
            return 'assertEquals("'+value+'",executeJavaScript("return Array.from(arguments[0]).map(option => option.id).join();",'+target+'.getSelectedOptions()));';
        case "assertNotSelectedId":
        case "assertNotSelectedIds":
        case "verifyNotSelectedId":
        case "verifyNotSelectedIds":
            return 'assertNotEquals("'+value+'",executeJavaScript("return Array.from(arguments[0]).map(option => option.id).join();",'+target+'.getSelectedOptions()));';

        case "assertSelectedIndex":
        case "assertSelectedIndexes":
        case "verifySelectedIndex":
        case "verifySelectedIndexes":
            //asserts the selected index(es). Expecting a string such as "1,2,3" for multiple values.
            return 'assertEquals("'+value+'",executeJavaScript("var indexes = []; Array.from(arguments[0]).forEach(function (option,index){if(option.selected==true)indexes.push(index)}); return indexes.join();",'+target+'));//getSelectedIndex';
        case "assertNotSelectedIndex":
        case "assertNotSelectedIndexes":
        case "verifyNotSelectedIndex":
        case "verifyNotSelectedIndexes":
            //asserts the selected index(es) are not the specified value. Expecting a string such as "1,2,3" for multiple values.
            return 'assertNotEquals("'+value+'",executeJavaScript("var indexes = []; Array.from(arguments[0]).forEach(function (option,index){if(option.selected==true)indexes.push(index)}); return indexes.join();",'+target+'));';
                        
        case "assertSelectedLabel":
        case "verifySelectedLabel":
            //check the visible text of a selection in a select tool
            return 'assertEquals("' + value + '",' + target + '.getSelectedText());';
        case "assertNotSelectedLabel":
        case "verifyNotSelectedLabel":
            //check the visible text of a selection in a select tool
            return 'assertNotEquals("' + value + '",' + target + '.getSelectedText());';
            
        case "assertSelectedValue":
        case "verifySelectedValue":
            //asserts the value attribute associated with the selection in a toggle or select element
            return 'assertEquals("' + value + '", ' + target + '.getSelectedValue());';           
        case "assertNotSelectedValue":
        case "verifyNotSelectedValue":
            //asserts that the attribute associated with the selection is NOT the value in a toggle 
            return 'assertNotEquals("' + value + '", ' + target + '.getSelectedValue());';
            
        case "assertSomethingSelected":   
        case "verifySomethingSelected":   
            return 'assertTrue((Boolean) executeJavaScript("return arguments[0].selectedIndex >= 0", '+target+' ));//assertSomethingSelected';
        case "assertNotSomethingSelected": 
        case "verifyNotSomethingSelected":       
            return 'assertFalse((Boolean) executeJavaScript("return arguments[0].selectedIndex >= 0", '+target+' ));';

        case "assertTable":  
        case "verifyTable":  
            //assert the value of a cell. The address of the cell should be target.row.column, eg, foo.1.4
            //based on this javascript code where r = row index and c = column index:
            //document.querySelector("#table").children[0].children[r].children[c].innerText
            //Note: the rowIndex and columnIndex variables were declared with special handling near the top
            return 'assertEquals("' + value + '", executeJavaScript("return arguments[0].children[0].children[arguments[1]].children[arguments[2]].innerText",'+target+', '+rowIndex+','+columnIndex+'));';          
        case "assertNotTable":  
        case "verifyNotTable":  
            return 'assertNotEquals("' + value + '", executeJavaScript("return arguments[0].children[0].children[arguments[1]].children[arguments[2]].innerText",'+target+', '+rowIndex+','+columnIndex+'));';

        case "assertText":
        case "verifyText":
            return target + '.shouldHave(text("' + value + '"));';       
        case "assertNotText":
        case "verifyNotText":
            return target + '.shouldNotHave(text("' + value + '"));';       
            
        case "assertTitle":
        case "verifyTitle":
            //assert the page's title tag
            return 'assertEquals("' + target + '", title());';
        case "assertNotTitle":
        case "verifyNotTitle":
            return 'assertNotEquals("' + target + '", title());';          
            
        case "assertValue": 
        case "verifyValue":       
            return target + '.shouldHave(value("' + value + '"));';
        case "assertNotValue":  
        case "verifyNotValue":      
            return target + '.shouldNotHave(value("' + value + '"));';
                        
        case "assertVisible":
        case "verifyVisible":
             return target + '.shouldBe(visible);';
        case "assertNotVisible":
        case "verifyNotVisible":
             return target + '.shouldNotBe(visible);';     
          
        case "assertWhetherThisWindowMatchWindowExpression":
        case "assertWhetherThisFrameMatchFrameExpression":
        case "verifyWhetherThisWindowMatchWindowExpression":
        case "verifyWhetherThisFrameMatchFrameExpression":
            //assert current window/frame name
            return 'assertEquals("' + value + '", executeJavaScript("return window.name"));//assert current window/frame name';
        case "assertNotWhetherThisWindowMatchWindowExpression":
        case "assertNotWhetherThisFrameMatchFrameExpression":
        case "verifyNotWhetherThisWindowMatchWindowExpression":
        case "verifyNotWhetherThisFrameMatchFrameExpression":
            return 'assertNotEquals("' + value + '", executeJavaScript("return window.name"));';

        case "assertXpathCount": 
        case "verifyXpathCount":       
            return 'assertEquals(' + value + ', $' + target + '.size());';
        case "assertNotXpathCount":   
        case "verifyNotXpathCount":     
            return 'assertNotEquals(' + value + ', $' + target + '.size());';
            
        case "captureEntirePageScreenshot":
            //different browsers may respond differently. Firefox may take a screenshot of the entire page while Chrome only takes a screenshot of the viewport
            return "await browser.saveScreenshot('" + target + "');";

        case "check":
            //check a checkbox
            return 'await browser.execute("arguments[0].checked = true;", '+target+');';
        case "uncheck":
            //uncheck a checkbox
            return 'await browser.execute("arguments[0].checked = false;", '+target+');';
        
        case "chooseCancelOnNextPrompt" :
        case "chooseCancelOnNextConfirmation" :
             return 'await browser.dismissAlert();//Manually move this command to be after the command that opens the prompt/confirmation to choose "cancel".';
 
        case "chooseOkOnNextConfirmation" :
            return 'await browser.acceptAlert();//Manually move this command to be after the command that opens the confirmation to choose "OK".';
            
        case "click":
            return "await (" + target + ").click();";
            
        case "clickAt":
            //click an element at specific X and Y coordinates, such as at "10,20"
            var xYArray = value.split(",");
            var xOffset = xYArray[0];
            var yOffset = xYArray[1];
            return "await (" + target + ").click({ x: '" + xOffset + "', y: '" + yOffset + "'});";
            //source: https://webdriver.io/docs/api/element/click

        case "close":
            return "await browser.closeWindow()";

        case "contextMenu":
            //right-click
            return "await (" + target + ").click({ button: 'right' });";
        
        case "controlKeyDown":
            return "//for the control key: await browser.keys(['Control', 'text']);";

        case "shiftKeyDown":
            return "//for the shift key: await browser.keys(['Shift', 'text']);";
            
        case "createCookie":
            var nameValueArray = target.split("=");
            var cookieName = nameValueArray[0];
            var cookieValue = nameValueArray[1];
            return "await browser.setCookies([{name: '" + cookieName + "', value: '" + cookieValue + "'}]);";

            case "deleteAllVisibleCookies":
            return "await browser.deleteCookies();"
            //alternate: browser.deleteAllCookies();
            
        case "deleteCookie":
            return "await browser.deleteCookies(['" + target + "']);";
            //alternate: browser.deleteNamedCookie('name');
                  
        case "doubleClick":
            return "await (" + target + ").doubleClick();";
                    
        case "dragAndDropToObject":  
            return "await (" + target + ").dragAndDrop(" + value + ");";
                                   
        case "echo":
            return `await browser.execute('console.log("*****************echo value:"); console.log("` + target + `")');`;
            
        case "focus":
            return "await browser.execute('arguments[0].focus()'," + target + ");";
            
        case "goBack":
            return "await browser.back()');";

        case "highlight":
            return `await browser.execute("arguments[0].setAttribute('style','border: solid red; background: yellow')",` + target + `);//highlight`;
       
        case "mouseMoveAt":
            //moves the mouse at an x,y position relative to the element's location
            var xYArray = value.split(",");
            var xOffset = xYArray[0];
            var yOffset = xYArray[1];
            return 'await (' + target + ').moveTo({'+xOffset+','+yOffset+'});';

        case "mouseOver":
            return 'await (' + target + ').moveTo();';
            
        case "mouseOut":
            return '//mouseOut is not supported';
            
        case "open":
            return "await browser.url('" + target + "');";
            
        case "openWindow":
            return "browser.newWindow(" + target + ", {" + value + "});";//target is the URL, value is the name

        case "pause":
            return (target)? 'await browser.pause('+target+');' : 'await browser.pause('+value+');'//the pause command can use either a target or a value  

        case "refresh":
            //refresh the current page
            return "await browser.refresh();";
            
        case "removeAllSelections":
            //remove all selections from a multi-select box
            return 'await browser.execute("arguments[0].selectedIndex = -1;",' + target + ');//removeAllSelections';
            //source: https://stackoverflow.com/a/42170881';
            
        case "removeScript":
            //remove a javascript tag and its content
            return 'await browser.execute("arguments[0].remove()",' + target + ');';
        
        case "removeSelection":    
            //unselect an option in a multi-select box. The target should be the multi-select box and the value should be the option text.
            return "removeSelection is not supported in this plugin";
            
        case "runScript":
            return "await browser.execute('" + value + "');";
            
        case "select":
            //select an option by text in a select tool
            return "await (" + target + ").selectByVisibleText('" + value + "');";

        case "selectFrame":  
            return "await browser.selectFrame("+target+");";//expecting an index number 
            
        case "selectPopUp":
        case "selectWindow":
            return "await browser.switchWindow('" + value + "');";    
            
        case "sendKeys":
        case "type":
        case "typeKeys":
            return `await browser.execute('arguments[0].focus()', ` + target +  `);\n` +
            `await browser.keys('["` + value + `"]');`;
                     
        case "setText":
            //for input fields
            return "await (" + target + ").setValue('" + value + "');";

        case "store":
            //store a value in a variable
            return "var " + target + " = " + value + ";";
            
        case "submit":
            //click the submit button of a form element
            let response = "await formElm = " + target + ";" + "\n" +
            `var submitBtn = await formElm.$('[type="submit"]');` + "\n" +
            "await submitBtn.click();";
            return response;
            
        default:
            return "//Unsupported command: " + command + " | target: " + target + " | value: " + value;
    }
    //the URL with a list of these commands is https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
}

function formatTarget(target){
    if (!target){
        return '';
    }
    if(/^id=/.test(target)){
        target = target.replace("id=","");
        target = "await $('#" + target + "')";
    }else if(/^name=/.test(target)){
        target = target.replace("name=","");
        target = `await $('[name="` + target + `"]')`;
    }else if(/^xpath=/.test(target) || /^[/]/.test(target)){
        target = target.replace("xpath=","");
        target = "await $('" + target + "')";
    }else if(/^link=/.test(target)){
        target = target.replace("link=","");
        target = "await $('=" + target + "')";
    }else if(/^css=/.test(target)){
        target = target.replace("css=","");
        target = "await $('" + target + "')";
    }
    return target;
}

function formatValue(value){
    if (!value){
        return '';
    }
    value = value.replace("label=","");
    return value;
}

function separateAttributeFromTarget(target){
    //extract the text after the @ as the attribute name (target@href)
    var targetAttributeArr = /(.*)@(.*)?/.exec(target);//separate the contents after the last @ char.
    target = targetAttributeArr[1];
    var attribute = targetAttributeArr[2];
    return [target,attribute];
}

function separateTableXYFromTarget(target){
    //separate the .y.x after the target for the table coordinates, where y = row index and x = column index (such as tableLocator.row.column) as seen at https://selenium.dev/selenium/docs/api/dotnet/html/M_Selenium_ISelenium_GetTable.htm, ex: foo.1.4
    var targetwithXYcoordinatesArray = /(.*)[.](.*)?[.](.*)?/.exec(target);
    target = targetwithXYcoordinatesArray[1];
    var rowIndex = targetwithXYcoordinatesArray[2];
    var columnIndex = targetwithXYcoordinatesArray[3]; 
    return [target,rowIndex,columnIndex];
}