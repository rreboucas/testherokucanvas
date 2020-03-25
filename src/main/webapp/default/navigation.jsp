<%--
Copyright (c) 2013, salesforce.com, inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided
that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the
following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
the following disclaimer in the documentation and/or other materials provided with the distribution.

Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
--%>
<script type="text/javascript" src="/sdk/js/client.js"></script>
<script type="text/javascript">
    function NavToRecord(){

        Sfdc.canvas.client.publish(sr.client,{
            name : 's1.navigateToSObject',
            payload : '{recordId: "00641000008BFX7AAO", view: "detail"}'
        });
        
        System.out.println ("Fired NavToRecord: ");
        return true;
    }

    function NavToURL(){


        Sfdc.canvas.client.publish(sr.client,{
            name : 's1.navigateToURL',
            payload : '{url: "https://appexchange.salesforce.com/appxListingDetail?listingId=a0N300000016aXSEAY", isredirect: “true”}'
        });
        System.out.println ("Fired NavToURL: ");
        return true;
    }

</script>
<p>
Example of Navigation Events from Canvas App to Salesforce for Oracle to test mobile navigation
</p> 

<table>
    <tr>
        <td></td>
        <td><input type='button' value='Nav to Record' onclick="NavToRecord();" type="submit"/></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><input type='button' value='Open URL (eg. Generate Proposal)' onclick="NavToURL();" type="submit"/></td>
        <td></td>
    </tr>
</table>
