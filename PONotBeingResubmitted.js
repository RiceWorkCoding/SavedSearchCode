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
                const vendorId = request.parameters.vendorId;
                if (!vendorId) throw new Error('Missing vendorId parameter on GET.');

                const vendorRec = record.load({
                    type: record.Type.VENDOR,
                    id: vendorId
                });

                const unableToLogin = vendorRec.getValue('custentity_unable_to_login');
                const loginFailureReason = vendorRec.getValue('custentity_reason_for_login_failure');
                const vendorName = vendorRec.getValue('altname');

                const form = ui.createForm({ title: `Edit Vendor: ${vendorName}` });

                form.addFieldGroup({ id: 'main_grp', label: 'Vendor Info' });

                // Hidden field to persist vendorId
                const hiddenIdField = form.addField({
                    id: 'custpage_vendorid_hidden',
                    type: ui.FieldType.TEXT,
                    label: 'Vendor Internal ID'
                });
                hiddenIdField.updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN });
                hiddenIdField.defaultValue = vendorId;

                // Display Vendor Name
                form.addField({
                    id: 'custpage_vendorname',
                    type: ui.FieldType.TEXT,
                    label: 'Vendor',
                    container: 'main_grp'
                }).updateDisplayType({ displayType: ui.FieldDisplayType.INLINE })
                  .defaultValue = vendorName;

                // Checkbox
                form.addField({
                    id: 'custpage_verified',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Unable to Login?',
                    container: 'main_grp'
                }).defaultValue = unableToLogin ? 'T' : 'F';

                // Textarea
                form.addField({
                    id: 'custpage_notes',
                    type: ui.FieldType.TEXTAREA,
                    label: 'Reason for Login Failure',
                    container: 'main_grp'
                }).defaultValue = loginFailureReason || '';

                form.addSubmitButton({ label: 'Save Changes' });

                response.writePage(form);

            } else if (request.method === 'POST') {
                log.debug('POST Parameters', request.parameters);

                const vendorId = request.parameters.custpage_vendorid_hidden;
                if (!vendorId) throw new Error('Missing vendorId parameter on POST.');

                const newChecked = request.parameters.custpage_verified === 'T';
                const newNote = request.parameters.custpage_notes || '';

                const vendorRec = record.load({
                    type: record.Type.VENDOR,
                    id: vendorId,
                    isDynamic: true
                });

                vendorRec.setValue({ fieldId: 'custentity_unable_to_login', value: newChecked });
                vendorRec.setValue({ fieldId: 'custentity_reason_for_login_failure', value: newNote });

                const savedId = vendorRec.save();

                // Build confirmation with 10-second live countdown
                const form = ui.createForm({ title: 'Vendor Updated' });
                const html = `
                    <div style="padding:10px;font-size:14px;">
                        ✅ Vendor <b>${savedId}, ${vendorRec.getValue('altname')}</b> updated successfully.<br><br>
                        <a href="/app/common/entity/vendor.nl?id=${savedId}" target="_blank">View Vendor Record</a><br><br>
                        This window will auto-close in <span id="countdown">10</span> seconds.
                        <script>
                            if (window.opener && !window.opener.closed) {
                                window.opener.location.reload();
                            }

                            let seconds = 10;
                            const countdownEl = document.getElementById('countdown');
                            const interval = setInterval(() => {
                                seconds -= 1;
                                countdownEl.textContent = seconds;
                                if (seconds <= 0) {
                                    clearInterval(interval);
                                    window.close();
                                }
                            }, 1000);
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
