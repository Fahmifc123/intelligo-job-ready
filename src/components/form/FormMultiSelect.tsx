import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {FormMultiSelectProps} from "@/types/form";
import {MultiSelect} from "@/components/custom/components/MultiSelect";
import React from "react";

const FormMultiSelect = ({form, item, ...props} : FormMultiSelectProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{item.label}</FormLabel>
          <FormControl>
            <MultiSelect
              {...props}
              value={field.value}
              onValueChange={field.onChange}
              options={item.options.map(option => ({label: option.label, value: option.value}))}
            />
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  );
};

export default FormMultiSelect;