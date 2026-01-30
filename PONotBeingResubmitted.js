/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/ui/serverWidget', 'N/log'], (record, ui, log) => {
    const onRequest = (context) => {
        const { request, response } = context;

        try {
            if (request.method === 'GET') {
                const purchaseOrderId = request.parameters.purchaseOrderId;
                if (!purchaseOrderId) throw new Error('Missing purchaseOrderId parameter on GET.');

                const PORecord = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: purchaseOrderId
                });

                const notResubmitted = PORecord.getValue('custbody_not_resub_chxbox');
                const noResubReason = PORecord.getValue('custbody_reason_for_no_resub');
                const PONumber = PORecord.getValue('tranid');

                const form = ui.createForm({ title: `Edit Purchase Order: ${PONumber}` });

                form.addFieldGroup({ 
                    id: 'main_grp', 
                    label: 'Purchase Order Info' 
                });

                // Hidden field to persist purchaseOrderId
                const hiddenIdField = form.addField({
                    id: 'custpage_poid_hidden',
                    type: ui.FieldType.TEXT,
                    label: 'Purchase Order Internal ID'
                });
                hiddenIdField.updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN });
                hiddenIdField.defaultValue = purchaseOrderId;

                // Display Purchase Order Number
                form.addField({
                    id: 'custpage_purchaseorder',
                    type: ui.FieldType.TEXT,
                    label: 'Purchase Order Number',
                    container: 'main_grp'
                }).updateDisplayType({ displayType: ui.FieldDisplayType.INLINE })
                  .defaultValue = PONumber;

                // Checkbox
                form.addField({
                    id: 'custpage_verified',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Not Being Resubmitted',
                    container: 'main_grp'
                }).defaultValue = notResubmitted ? 'T' : 'F';

                // Textarea
                form.addField({
                    id: 'custpage_notes',
                    type: ui.FieldType.TEXTAREA,
                    label: 'Reason for Not Being Resubmitted',
                    container: 'main_grp'
                }).defaultValue = noResubReason || '';

                form.addSubmitButton({ label: 'Save Changes' });

                response.writePage(form);

            } else if (request.method === 'POST') {
                log.debug('POST Parameters', request.parameters);

                const POId = request.parameters.custpage_poid_hidden;
                if (!POId) throw new Error('Missing purchaseOrderId parameter on POST.');

                const newChecked = request.parameters.custpage_verified === 'T';
                const newNote = request.parameters.custpage_notes || '';

                const PORec = record.load({
                    type: record.Type.VENDOR,
                    id: POId,
                    isDynamic: true
                });

                PORec.setValue({ fieldId: 'custbody_not_resub_chxbox', value: newChecked });
                PORec.setValue({ fieldId: 'custbody_reason_for_no_resub', value: newNote });

                const savedId = PORec.save();

                // Build confirmation with 5-second live countdown
                const form = ui.createForm({ title: 'Purchase Order Updated' });
                const html = `
                    <div style="padding:10px;font-size:14px;">
                        ✅ Vendor <b>${savedId}, ${PORec.getValue('altname')}</b> updated successfully.<br><br>
                        <a href="/app/common/entity/vendor.nl?id=${savedId}" target="_blank">View Vendor Record</a><br><br>
                        This window will auto-close in <span id="countdown">5</span> seconds.
                        <script>
                            if (window.opener && !window.opener.closed) {
                                window.opener.location.reload();
                            }

                            let seconds = 5;
                            const countdownEl = document.getElementById('countdown');
                            const interval = setInterval(() => {
                                seconds -= 1;
                                countdownEl.textContent = seconds;
                                if (seconds <= 0) {
                                    clearInterval(interval);
                                    window.close();
                                }
                            }, 500);
                        </script>
                    </div>
                `;
                form.addField({
                    id: 'custpage_success',
                    type: ui.FieldType.INLINEHTML,
                    label: 'Message'
                }).defaultValue = html;

                response.writePage(form);
            }

        } catch (e) {
            log.error('Suitelet Error', e);
            const form = ui.createForm({ title: 'Error' });
            form.addField({
                id: 'custpage_error',
                type: ui.FieldType.INLINEHTML,
                label: 'Error'
            }).defaultValue = `<div style="color:red;">${e.message}</div>`;
            response.writePage(form);
        }
    };

    return { onRequest };
});
