<%@ page import="canvas.SignedRequest" %>
<%@ page import="java.util.Map" %>
<%
    // Pull the signed request out of the request body and verify/decode it.
    Map<String, String[]> parameters = request.getParameterMap();
    String[] signedRequest = parameters.get("signed_request");
    if (signedRequest == null) {%>
        This App must be invoked via a signed request!<%
        return;
    }
    String yourConsumerSecret=System.getenv("CANVAS_CONSUMER_SECRET");
    String signedRequestJson = SignedRequest.verifyAndDecodeAsJson(signedRequest[0], yourConsumerSecret);
%>

<script type="text/javascript">

    

    function NavToRecord() {
        
        var payloadValue = {recordId: '00641000008BFX7AAO', view: "detail"};
        console.log("Fired NavToRecord - payloadValue: " + payloadValue);

        Sfdc.canvas.client.publish(sr.client,{
            name : 's1.navigateToSObject',
            payload : payloadValue
        });
        
        return true;
    }

    function NavToRecordCustom() {
        
        var payloadValue = {recordId: '00641000008BFX7AAO', view: "detail"};
        console.log("Fired NavToRecord - payloadValue: " + payloadValue);

        Sfdc.canvas.client.publish(sr.client,{
            name : 'oracle.navToRecord',
            payload : payloadValue
        });
        
        return true;
    }

    function NavToURL() {
        var payloadValue = {url: 'https://appexchange.salesforce.com/appxListingDetail?listingId=a0N300000016aXSEAY', isredirect: true};
        console.log("Fired NavToURL : ");
        Sfdc.canvas.client.publish(sr.client,{
            name : 's1.navigateToURL',
            payload : payloadValue
        });
        
        return true;
    }

    function NavToURLCustom() {
        var payloadValue = {url: 'https://appexchange.salesforce.com/appxListingDetail?listingId=a0N300000016aXSEAY', isredirect: true};
        console.log("Fired NavToURL : ");
        Sfdc.canvas.client.publish(sr.client,{
            name : 'oracle.navigateToURL',
            payload : payloadValue
        });
        
        return true;
    }

    function CloseConsoleTabCustomEvent() {
        
        console.log("Fired NavToURL : ");
        Sfdc.canvas.client.publish(sr.client,{
            name : 'guidewire.closeConsoleTab'
        });
        
        return true;
    }

    function GetSignedRequest() {
        
        console.log("Get Signed Request entered ");
        var signedRequest = JSON.parse('<%=signedRequestJson%>');
        
        console.log("signReq: " + signedRequest);
    }

    function createAccount() {
        var payloadValue = {entityName: 'Account'};
        console.log("Fired NavToURL: ");
        Sfdc.canvas.client.publish(sr.client,{
            name : 's1.createRecord',
            payload : payloadValue
        });
        
        return true;
    }

</script>
<p>
Example of Navigation Events from Canvas App to Salesforce for Oracle to test mobile navigation
</p> 

<table>
    <tr>
        <td></td>
        <td><input type='button' value='Nav to Record (s1 event)' onclick='NavToRecord();' type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Nav to Record (custom event)' onclick='NavToRecordCustom();' type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Open URL (s1 event)' onclick='NavToURL();' type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Open URL (custom event)' onclick='NavToURLCustom();' type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Get Signed Request' onclick='GetSignedRequest();' type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Close Console Tab' onclick='CloseConsoleTabCustomEvent();' type="submit"/></td>
        <td></td>
    </tr>
</table>
