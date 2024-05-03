import {zodResolver} from "@hookform/resolvers/zod"

import {Button} from "@/components/ui/button"
import {useForm} from "react-hook-form"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {SignupValidation} from "@/lib/validation"
import {z} from "zod"
import Loader from "@/components/shared/Loader"
import {Link, useNavigate} from "react-router-dom"
import {createUserAccount} from "@/lib/appwrite/api"
import {useToast} from "@/components/ui/use-toast"
import {useCreateUserAccount, useSignInAccount} from "@/lib/react-query/queriesAndMutations"
import {useUserContext} from "@/context/AuthContext"

const SignupForm = () => {
    const {toast} = useToast()
    const {checkAuthUser, isLoading: isUserLoading} = useUserContext()
    const navigate = useNavigate()

    const {mutateAsync: createUserAccount, isPending: isCreatingAccount} = useCreateUserAccount();
    const {mutateAsync: signInAccount, isPending: isSigningIn} = useSignInAccount();

    const form = useForm < z.infer < typeof SignupValidation >> ({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            username: "",
            name: "",
            email: "",
            password: ""
        }
    })

    async function onSubmit(values : z.infer < typeof SignupValidation >) {
        const newUser = await createUserAccount(values);
        if (!newUser) {
            return toast({title: "Sign up failed. Please try again"})
        }
        const session = await signInAccount({email: values.email, password: values.password})
        if (!session) {
            return toast({title: "Sign in failed. Please try again"})
        }
        const isLoggedIn = await checkAuthUser()

        if (isLoggedIn) {
            form.reset()
            navigate('/')
        } else {
          return toast ({title: "Sign up failed. Please try again"})
        }
    }

    return (
        <Form {...form}>

            <div className="sm:w-420 flex-center flex-col ">
                <img src="/assets/images/logo.svg"/>
                <h2 className="h-3-bold md:h2-bold pt-5 sm:pt-12">Create a new account
                </h2>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 w-full mt-4 justify-center items-center">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Name
                            </FormLabel>
                            <FormControl>
                                <Input type='text' className="shad-input" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Username
                            </FormLabel>
                            <FormControl>
                                <Input type='text' className="shad-input" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Email
                            </FormLabel>
                            <FormControl>
                                <Input type='text' className="shad-input" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                        <FormItem>
                            <FormLabel>Password
                            </FormLabel>
                            <FormControl>
                                <Input type='password' className="shad-input" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <Button type="submit" className="shad-button_primary">
                        {isCreatingAccount
                            ? (
                                <div className="flex-center gap-2 ">
                                    <Loader/>
                                    Loading...
                                </div>
                            )
                            : "Sign up"}
                    </Button>
                </form>
                <p className="text-sm text-gray-500 text-center pt-2">Already have an account?<Link
                    to="/sign-in"
                    className="text-primary-500 text-center mt-2 text-small-semibold ml-1">Log-in</Link>
                </p>
            </div>
        </Form>
    )
}
export default SignupForm