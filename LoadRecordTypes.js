//Load Record Types

record.Type.SALES_ORDER
record.Type.PURCHASE_ORDER
record.Type.INVOICE
record.Type.CASH_SALE
record.Type.CASH_REFUND
record.Type.CUSTOMER_PAYMENT
record.Type.VENDOR_BILL
record.Type.VENDOR_CREDIT
record.Type.VENDOR_PAYMENT
record.Type.JOURNAL_ENTRY
record.Type.CREDIT_MEMO
record.Type.DEPOSIT
record.Type.ITEM_FULFILLMENT
record.Type.ITEM_RECEIPT
record.Type.EXPENSE_REPORT
record.Type.TRANSFER_ORDER
record.Type.CUSTOMER
record.Type.VENDOR
record.Type.EMPLOYEE
record.Type.PARTNER
record.Type.CONTACT
record.Type.LEAD
record.Type.PROSPECT
record.Type.INVENTORY_ITEM
record.Type.NON_INVENTORY_ITEM
record.Type.SERVICE_ITEM
record.Type.ASSEMBLY_ITEM
record.Type.KIT_ITEM
record.Type.DESCRIPTION_ITEM
record.Type.DISCOUNT_ITEM
record.Type.SUBTOTAL_ITEM
record.Type.ACCOUNT
record.Type.CLASS
record.Type.DEPARTMENT
record.Type.LOCATION
record.Type.SUBSIDIARY
record.Type.TAX_GROUP
record.Type.TAX_CODE
record.Type.CURRENCY
record.Type.EXCHANGE_RATE

//Load Custom Record
record.load({
    type: 'customrecord_my_record',
    id: 123
  });
  