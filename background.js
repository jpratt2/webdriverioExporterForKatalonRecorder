var extensionId = 'ljdobmomdgdljniojadhoplhkpialdid'; //this is the extensionId of the Katalon Recorder plugin

function register() {
    chrome.runtime.sendMessage(
        extensionId,
        {
            type: 'katalon_recorder_register',
            payload: {
                capabilities: [
                    {
                        id: 'webdriverio', // unique ID for each capability
                        summary: 'WebdriverIO', // user-friendly name seen in exporter
                        type: 'export' // for now only 'export' is available
                    }
                ]
            }
        }
    );
}

register();

setInterval(register, 60 * 1000);

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    if (message.type === 'katalon_recorder_export') {
        var payload = message.payload;
        var commands = payload.commands;
        var content = '';
        var extension = 'js';
        var mimetype = 'text/javascript';        
        var indent = '    ';
        switch (payload.capabilityId) {
            case 'webdriverio':
                content += 
                "describe('Test suite', () => {\n" +
                indent + "it('The expectation should be present', async () => {\n";
                
                for (var i = 0; i < commands.length; i++) {
                    var command = commands[i];
                    var newSyntax = convertKatalonSyntax(command.command, command.target, command.value);
                    content += newSyntax ? indent + indent + newSyntax + "\n" : "";
                }
                                
                content += indent + "})" + "\n" +
                        "});";
        }
        sendResponse({
            status: true,
            payload: {
                content: content,
                extension: extension,
                mimetype: mimetype
            }
        });
    }
});
