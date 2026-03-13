import React from "react";
import { APP_CONFIG } from "@/constants/config";

const AppLogoSimple = () => {
  return (
    <div className='flex items-center gap-3 cursor-pointer'>
      <div className="flex items-center justify-center justify-items-center p-[6px]">
        <img src={APP_CONFIG?.app?.logo} width={28} height={28} alt="shadow-sm"/>
      </div>
      <div className='grid text-left text-sm leading-tight'>
        <span className='font-semibold'>{APP_CONFIG?.app?.name}</span>
        <span className='text-xs text-muted-foreground'>{APP_CONFIG?.app?.description}</span>
      </div>
    </div>
  )
}

export default AppLogoSimple;
