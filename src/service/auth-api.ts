import {useMutation} from "@tanstack/react-query";
import {useAuth} from "@/hooks/use-auth";
import {useNavigate, useRouter} from "@tanstack/react-router";
import {authClient} from "@/lib/auth-client";
import {fetchApi} from "@/lib/fetch-api";
import {AppApi} from "@/constants/app-api";
import {AuthProps} from "@/types/auth";

export const useLoginMutation = () => {
  const auth = useAuth();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({body}: { body: Record<string, any> }) => {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('certificateId', body.certificateId);

      const response = await fetchApi({
        method: "POST", 
        url: `${AppApi.auth.login}`, 
        body: formData, // Send FormData instead of JSON
        withCredentials: true,
        headers: {
          // Remove Content-Type header to let browser set it with boundary
        }
      });

      let userData: AuthProps = {token: null, user: null};
      if (response?.token) {
        userData = {
          token: response.token,
          user: response.user
        }
      } else {
        throw new Error("Error get session");
      }

      await (auth.login(userData));
      return(userData);
    },
  });
}

export const useLoginMutationEmail = () => {
  const auth = useAuth();

  return useMutation({
    mutationKey: ['login-email'],
    mutationFn: async ({body}: { body: any }) => {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
      // Only append fields that have values
      if (body.email) {
        formData.append('email', body.email);
      }
      if (body.password) {
        formData.append('password', body.password);
      }
      if (body.certificateId) {
        formData.append('certificateId', body.certificateId);
      }

      const response = await fetchApi({
        method: "POST", 
        url: AppApi.auth.login, 
        body: formData,
        withCredentials: true,
        headers: {
          // Remove Content-Type header to let browser set it with boundary
        }
      });

      let userData: AuthProps = {token: null, user: null};
      if (response?.token) {
        userData = {
          token: response.token,
          user: response.user
        }
      } else {
        throw new Error("Error get session");
      }

      await (auth.login(userData));
      return(userData);
    },
  });
}

export const useLogoutMutation = () => {
  const auth = useAuth();
  const router = useRouter()
  const navigate = useNavigate()

  return (
    useMutation({
      mutationKey: ['logout'],
      mutationFn: async () => {
        auth.logout().then(() => {
          router.invalidate().finally(() => {
          })
        })

        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
            },
            onError: () => {
            },
          },
        });
        navigate({to: '/'}).then(() => {});
      },
    })
  )
}